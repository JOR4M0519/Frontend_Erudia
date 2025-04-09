# Etapa 1: Construcción
FROM node:18-alpine AS builder
WORKDIR /app
# Copia de archivos de dependencias y se instalan
COPY package*.json ./
RUN npm install
# Copia el resto de la aplicación
COPY . .
# Ejecuta el build para generar la carpeta 'dist'
RUN npm run build

# Etapa 2: Producción
FROM nginx:stable-alpine
# Copia los archivos construidos en la carpeta de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html
# Copia el archivo de configuración personalizado de Nginx
COPY default.conf /etc/nginx/conf.d/default.conf
# Expone el puerto 80 para el tráfico HTTP
EXPOSE 80
# Ejecuta Nginx en modo foreground
CMD ["nginx", "-g", "daemon off;"]
