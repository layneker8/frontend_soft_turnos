// ============================================
// EXPRESS + SOCKET.IO + REDIS
// Backend Completo con Explicaciones
// ============================================

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const redis = require('redis');
const cors = require('cors');

// ============================================
// PASO 1: CREAR APLICACIÓN EXPRESS
// ============================================
const app = express();

// Middleware básico
app.use(cors()); // Permitir peticiones desde React
app.use(express.json()); // Parsear JSON en el body

// ============================================
// PASO 2: CREAR SERVIDOR HTTP
// Este servidor maneja TANTO Express COMO Socket.IO
// ============================================
const server = http.createServer(app);
// Ahora 'server' puede manejar:
// - HTTP requests normales (GET, POST, etc.) → Express
// - WebSocket connections → Socket.IO

// ============================================
// PASO 3: CONFIGURAR SOCKET.IO
// Se "monta" sobre el servidor HTTP
// ============================================
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173'], // React/Vite
    methods: ['GET', 'POST'],
    credentials: true
  },
  // Configuraciones adicionales
  transports: ['websocket', 'polling'], // Prioriza WebSocket
  pingTimeout: 60000, // 60 segundos antes de considerar desconexión
  pingInterval: 25000 // Envía ping cada 25 segundos
});

// ============================================
// PASO 4: CONFIGURAR REDIS
// ============================================
const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379,
  // password: 'tu_password', // Si Redis tiene auth
  // socket: {
  //   reconnectStrategy: (retries) => Math.min(retries * 50, 500)
  // }
});

// Cliente separado para Pub/Sub (IMPORTANTE)
const redisSubscriber = redis.createClient({
  host: 'localhost',
  port: 6379
});

// Conectar clientes
(async () => {
  try {
    await redisClient.connect();
    await redisSubscriber.connect();
    console.log('✅ Redis conectado');

    // Suscribirse al canal de actualizaciones
    await redisSubscriber.subscribe('turnos:actualizacion', (mensaje) => {
      const data = JSON.parse(mensaje);
      console.log('📢 Mensaje de Redis:', data.tipo);
      
      // AQUÍ está la magia: Redis → Socket.IO → Todos los clientes
      io.emit('turno:actualizado', data);
    });
  } catch (error) {
    console.error('❌ Error conectando Redis:', error);
  }
})();

// Manejo de errores
redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisSubscriber.on('error', (err) => console.error('Redis Subscriber Error:', err));

// ============================================
// PASO 5: LÓGICA DE NEGOCIO (Servicios)
// ============================================
class TurnoService {
  
  static async crearTurno(cliente, servicio) {
    // 1. Generar número único (atómico)
    const numeroTurno = await redisClient.incr('turno:contador');
    
    // 2. Crear objeto turno
    const turno = {
      numero: numeroTurno,
      cliente: cliente,
      servicio: servicio,
      estado: 'esperando',
      ventanilla: null,
      creado: new Date().toISOString(),
      timestamp: Date.now()
    };
    
    // 3. Guardar en Redis (expira en 24 horas)
    await redisClient.setEx(
      `turno:${numeroTurno}`,
      86400, // TTL: 86400 segundos = 24 horas
      JSON.stringify(turno)
    );
    
    // 4. Agregar a cola FIFO
    await redisClient.lPush('cola:espera', numeroTurno.toString());
    
    // 5. Publicar evento (esto dispara el subscriber)
    await redisClient.publish(
      'turnos:actualizacion',
      JSON.stringify({
        tipo: 'nuevo_turno',
        turno: turno
      })
    );
    
    console.log(`✅ Turno ${numeroTurno} creado`);
    return { success: true, turno };
  }
  
  static async llamarSiguienteTurno(ventanilla) {
    // 1. Sacar siguiente turno (RPOP = último de la lista = primero en entrar)
    const numeroTurno = await redisClient.rPop('cola:espera');
    
    if (!numeroTurno) {
      return { success: false, mensaje: 'No hay turnos en espera' };
    }
    
    // 2. Obtener datos del turno
    const turnoData = await redisClient.get(`turno:${numeroTurno}`);
    const turno = JSON.parse(turnoData);
    
    // 3. Actualizar estado
    turno.estado = 'llamado';
    turno.ventanilla = ventanilla;
    turno.tiempoLlamado = new Date().toISOString();
    
    // 4. Guardar cambios
    await redisClient.setEx(`turno:${numeroTurno}`, 86400, JSON.stringify(turno));
    
    // 5. Marcar ventanilla como ocupada
    await redisClient.setEx(
      `turno:activo:ventanilla:${ventanilla}`,
      3600, // Expira en 1 hora
      numeroTurno
    );
    
    // 6. Publicar evento
    await redisClient.publish(
      'turnos:actualizacion',
      JSON.stringify({
        tipo: 'turno_llamado',
        turno: turno
      })
    );
    
    console.log(`✅ Turno ${numeroTurno} → Ventanilla ${ventanilla}`);
    return { success: true, turno };
  }
  
  static async finalizarTurno(numeroTurno) {
    const turnoData = await redisClient.get(`turno:${numeroTurno}`);
    
    if (!turnoData) {
      return { success: false, mensaje: 'Turno no encontrado' };
    }
    
    const turno = JSON.parse(turnoData);
    turno.estado = 'finalizado';
    turno.tiempoFinalizado = new Date().toISOString();
    
    // Actualizar turno
    await redisClient.setEx(`turno:${numeroTurno}`, 86400, JSON.stringify(turno));
    
    // Liberar ventanilla
    if (turno.ventanilla) {
      await redisClient.del(`turno:activo:ventanilla:${turno.ventanilla}`);
    }
    
    // Publicar evento
    await redisClient.publish(
      'turnos:actualizacion',
      JSON.stringify({
        tipo: 'turno_finalizado',
        turno: turno
      })
    );
    
    console.log(`✅ Turno ${numeroTurno} finalizado`);
    return { success: true, turno };
  }
  
  static async obtenerCola() {
    const numerosTurnos = await redisClient.lRange('cola:espera', 0, -1);
    const turnos = await Promise.all(
      numerosTurnos.map(async (num) => {
        const data = await redisClient.get(`turno:${num}`);
        return data ? JSON.parse(data) : null;
      })
    );
    return turnos.filter(t => t !== null).reverse();
  }
  
  static async obtenerTurnosActivos() {
    const keys = await redisClient.keys('turno:activo:ventanilla:*');
    const turnos = await Promise.all(
      keys.map(async (key) => {
        const numeroTurno = await redisClient.get(key);
        const turnoData = await redisClient.get(`turno:${numeroTurno}`);
        return turnoData ? JSON.parse(turnoData) : null;
      })
    );
    return turnos.filter(t => t !== null);
  }
}

// ============================================
// PASO 6: RUTAS API REST (EXPRESS)
// Estas son peticiones HTTP normales
// ============================================

// Health check
app.get('/', (req, res) => {
  res.json({
    mensaje: '🎫 Sistema de Turnos API',
    version: '1.0.0',
    endpoints: {
      'POST /api/turnos': 'Crear turno',
      'POST /api/turnos/llamar': 'Llamar turno',
      'POST /api/turnos/:numero/finalizar': 'Finalizar turno',
      'GET /api/turnos/cola': 'Ver cola',
      'GET /api/turnos/activos': 'Ver activos'
    }
  });
});

// Crear turno
app.post('/api/turnos', async (req, res) => {
  try {
    const { cliente, servicio } = req.body;
    
    if (!cliente || !servicio) {
      return res.status(400).json({
        error: 'Cliente y servicio son requeridos'
      });
    }
    
    const resultado = await TurnoService.crearTurno(cliente, servicio);
    res.status(201).json(resultado);
    
  } catch (error) {
    console.error('Error en POST /api/turnos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Llamar siguiente turno
app.post('/api/turnos/llamar', async (req, res) => {
  try {
    const { ventanilla } = req.body;
    
    if (!ventanilla) {
      return res.status(400).json({
        error: 'Ventanilla es requerida'
      });
    }
    
    const resultado = await TurnoService.llamarSiguienteTurno(ventanilla);
    res.json(resultado);
    
  } catch (error) {
    console.error('Error en POST /api/turnos/llamar:', error);
    res.status(500).json({ error: error.message });
  }
});

// Finalizar turno
app.post('/api/turnos/:numero/finalizar', async (req, res) => {
  try {
    const { numero } = req.params;
    const resultado = await TurnoService.finalizarTurno(numero);
    res.json(resultado);
    
  } catch (error) {
    console.error('Error finalizando turno:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener cola de espera
app.get('/api/turnos/cola', async (req, res) => {
  try {
    const turnos = await TurnoService.obtenerCola();
    res.json({ turnos });
    
  } catch (error) {
    console.error('Error obteniendo cola:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener turnos activos
app.get('/api/turnos/activos', async (req, res) => {
  try {
    const turnos = await TurnoService.obtenerTurnosActivos();
    res.json({ turnos });
    
  } catch (error) {
    console.error('Error obteniendo turnos activos:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// PASO 7: MANEJADORES DE SOCKET.IO
// Estas son conexiones WebSocket persistentes
// ============================================

// Middleware de Socket.IO (se ejecuta antes de cada conexión)
io.use((socket, next) => {
  // Aquí puedes validar tokens, autenticación, etc.
  const token = socket.handshake.auth.token;
  
  // if (!validarToken(token)) {
  //   return next(new Error('Autenticación fallida'));
  // }
  
  console.log('🔐 Autenticación OK para socket:', socket.id);
  next();
});

// Evento: Cliente conectado
io.on('connection', (socket) => {
  console.log('✅ Cliente conectado:', socket.id);
  console.log('   IP:', socket.handshake.address);
  console.log('   Total clientes:', io.engine.clientsCount);
  
  // Enviar datos iniciales al conectarse
  TurnoService.obtenerCola().then(turnos => {
    socket.emit('estado:inicial', { turnos });
  });
  
  // Evento personalizado: Solicitar actualización
  socket.on('solicitar:actualizacion', async () => {
    console.log('📥 Cliente solicitó actualización');
    const [cola, activos] = await Promise.all([
      TurnoService.obtenerCola(),
      TurnoService.obtenerTurnosActivos()
    ]);
    socket.emit('datos:actualizados', { cola, activos });
  });
  
  // Evento personalizado: Unirse a sala específica (ventanilla)
  socket.on('unirse:ventanilla', (ventanilla) => {
    socket.join(`ventanilla-${ventanilla}`);
    console.log(`📍 Socket ${socket.id} se unió a ventanilla-${ventanilla}`);
    
    // Enviar solo a esa ventanilla
    // io.to(`ventanilla-${ventanilla}`).emit('mensaje', data);
  });
  
  // Evento: Cliente desconectado
  socket.on('disconnect', (reason) => {
    console.log('❌ Cliente desconectado:', socket.id);
    console.log('   Razón:', reason);
    console.log('   Total clientes:', io.engine.clientsCount);
  });
  
  // Manejo de errores en el socket
  socket.on('error', (error) => {
    console.error('💥 Error en socket:', socket.id, error);
  });
});

// ============================================
// PASO 8: INICIAR SERVIDOR
// Un solo puerto sirve Express + Socket.IO
// ============================================
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════╗
║                                                    ║
║  🎫  Sistema de Turnos - Backend                  ║
║                                                    ║
║  ✅ Servidor HTTP + WebSocket: ${PORT.toString().padEnd(17)}║
║  ✅ Redis Pub/Sub: Activo                         ║
║  ✅ Express REST API: Activo                      ║
║  ✅ Socket.IO: Activo                             ║
║                                                    ║
║  📡 Endpoints disponibles:                        ║
║     http://localhost:${PORT}/                        ║
║     http://localhost:${PORT}/api/turnos              ║
║                                                    ║
║  🔌 WebSocket:                                     ║
║     ws://localhost:${PORT}                           ║
║                                                    ║
╚════════════════════════════════════════════════════╝
  `);
});

// ============================================
// PASO 9: MANEJO DE CIERRE GRACEFUL
// ============================================
process.on('SIGINT', async () => {
  console.log('\n⏹  Cerrando servidor...');
  
  // Cerrar conexiones de Socket.IO
  io.close(() => {
    console.log('✅ Socket.IO cerrado');
  });
  
  // Desconectar Redis
  await redisClient.quit();
  await redisSubscriber.quit();
  console.log('✅ Redis desconectado');
  
  // Cerrar servidor HTTP
  server.close(() => {
    console.log('✅ Servidor HTTP cerrado');
    process.exit(0);
  });
});

// ============================================
// RESUMEN DEL FLUJO:
// ============================================
/*

1. PETICIÓN HTTP (Express):
   Cliente → POST /api/turnos → Express → Redis → Response

2. EVENTO TIEMPO REAL (Socket.IO):
   Redis Pub → Subscriber → Socket.IO → emit() → Todos los clientes

3. CONEXIÓN PERSISTENTE:
   Cliente se conecta → WebSocket abierto → Recibe eventos en tiempo real


DIFERENCIAS CLAVE:

╔════════════════╦═══════════════════╦═══════════════════════╗
║                ║ Express (HTTP)    ║ Socket.IO (WebSocket) ║
╠════════════════╬═══════════════════╬═══════════════════════╣
║ Conexión       ║ Request/Response  ║ Persistente           ║
║ Dirección      ║ Cliente → Server  ║ Bidireccional         ║
║ Cuándo usar    ║ CRUD, consultas   ║ Notificaciones        ║
║ Ejemplo        ║ POST /api/turnos  ║ emit('actualizado')   ║
╚════════════════╩═══════════════════╩═══════════════════════╝

FLUJO COMPLETO:

1. Admin crea turno
   └─> POST /api/turnos (Express)
       └─> Redis guarda turno
           └─> Redis PUBLISH mensaje
               └─> Redis Subscriber recibe
                   └─> Socket.IO emit a todos
                       └─> Pantallas actualizan

*/


// ✅ Para notificaciones en tiempo real
// socket.on('turno:actualizado') // Escuchar cambios

// // ✅ Para sincronización continua
// socket.emit('solicitar:actualizacion') // Pedir datos

// // ✅ Para chat o comunicación bidireccional
// socket.emit('mensaje', data) // Enviar al servidor
// socket.on('respuesta', data) // Recibir del servidor