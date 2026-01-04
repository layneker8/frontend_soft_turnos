# GitHub Actions - Configuración

Este proyecto utiliza GitHub Actions para CI/CD automatizado con deploy a VPS.

## Workflows Disponibles

### 1. CI - Validación (`ci.yml`)

**Se ejecuta en:** Push a `main`

**Qué hace:**

- ✅ Ejecuta ESLint
- ✅ Verifica tipos TypeScript
- ✅ Build de prueba para asegurar que compila

### 2. Deploy a VPS (`deploy.yml`)

**Se ejecuta en:** Push a `main` o manualmente

**Qué hace:**

- 🔐 Conecta al VPS vía SSH
- 📥 Hace `git pull` para obtener últimos cambios
- 📦 Instala dependencias con `npm install`
- 🏗️ Compila con `npm run build`
- 🔄 Reinicia Nginx (o tu servidor web)

## Configuración Necesaria

### Secrets de GitHub

Agrega estos secrets en GitHub (Settings → Secrets and variables → Actions):

**Obligatorios:**

```
VPS_HOST: 192.168.1.100 (o tu dominio)
VPS_USER: tu_usuario_ssh
VPS_SSH_KEY: -----BEGIN OPENSSH PRIVATE KEY----- (clave SSH privada completa)
VPS_PROJECT_PATH: /var/www/soft-turnos (ruta del proyecto en VPS)
```

**Opcionales:**

```
VPS_PORT: 22 (puerto SSH, por defecto 22)
```

### Generar clave SSH (si no tienes)

En tu VPS ejecuta:

```bash
ssh-keygen -t ed25519 -C "github-actions"
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/id_ed25519  # Copia TODA esta clave al secret VPS_SSH_KEY
```

### Configurar permisos en VPS

```bash
# Asegúrate de que tu usuario puede ejecutar sudo sin password para nginx
sudo visudo
# Agrega esta línea (reemplaza 'tuusuario'):
tuusuario ALL=(ALL) NOPASSWD: /bin/systemctl reload nginx
```

### Ajustar comando de reinicio

En [deploy.yml](deploy.yml), ajusta según tu configuración:

**Si usas Nginx:**

```yaml
sudo systemctl reload nginx
```

**Si usas PM2:**

```yaml
pm2 restart soft-turnos-frontend
```

**Si usas Docker:**

```yaml
docker-compose up -d --build
```

**Si solo sirves archivos estáticos (sin servidor):**

```yaml
# No necesitas reiniciar nada, solo comenta esa línea
```

## Flujo de Trabajo

```mermaid
graph LR
    A[git push main] --> B[CI: Validar código]
    B --> C[Deploy: SSH a VPS]
    C --> D[git pull en VPS]
    D --> E[npm install]
    E --> F[npm run build]
    F --> G[Reiniciar servidor]
    G --> H[✅ Deploy completo]
```

## Ejecutar Workflow Manualmente

El workflow de deploy puede ejecutarse manualmente desde GitHub:

1. Ve a Actions
2. Selecciona "Deploy a VPS"
3. Click en "Run workflow"

## Variables de Entorno (Opcional)

Si necesitas variables de entorno en el VPS, créalas en un archivo `.env` en el VPS:

```bash
# En tu VPS
cd /var/www/soft-turnos
nano .env.production
# Agrega tus variables
```

Vite las tomará automáticamente durante `npm run build`.

## Próximos Pasos

1. Configura los secrets necesarios en GitHub
2. Elige y descomenta tu método de deploy preferido
3. Haz push a `main` o `develop` para activar los workflows
4. Verifica en la pestaña "Actions" de GitHub
