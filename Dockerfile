# Etapa de desarrollo
FROM node:22-alpine AS development

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar código fuente
COPY . .
# Copiar .env desde la raíz del proyecto
COPY ../.env* ./

# Exponer puerto de Vite
EXPOSE 5173

# Hot reload con Vite
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]