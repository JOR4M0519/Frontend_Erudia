# Etapa 1: Construcción
FROM node:18-alpine AS builder
WORKDIR /app

# Definir ARG para usarlo durante la construcción
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Copia de archivos de configuración
COPY package*.json ./
# Instalación de dependencias
RUN npm install
# Copia del código fuente
COPY . .
# Construcción de la aplicación
RUN npm run build

# Etapa 2: Producción
FROM nginx:alpine
# Copiar la configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copiar los archivos de la aplicación
COPY --from=builder /app/dist /usr/share/nginx/html
# Exponer puerto
EXPOSE 5173
