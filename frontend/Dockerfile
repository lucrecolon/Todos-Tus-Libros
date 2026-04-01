# ---------- BUILD ----------
FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_ULTRA_TOKEN
ENV VITE_ULTRA_TOKEN=$VITE_ULTRA_TOKEN

# Copiar dependencias primero (mejora cache)
COPY package*.json ./
RUN npm install

# Copiar el resto del proyecto
COPY . .

# Build de Vite
RUN npm run build


# ---------- SERVE ----------
FROM nginx:alpine

# Elimina config por defecto
RUN rm -rf /usr/share/nginx/html/*

# Copia build generado por Vite
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia config custom de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]