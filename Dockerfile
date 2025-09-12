# ---- Build (Vite/React) ----
FROM node:20-alpine AS builder
WORKDIR /app

# Instala deps
COPY package*.json ./
RUN npm ci

# Copia o restante do código
COPY . .

# Build com variáveis de build do Vite (se precisar)
ARG VITE_GEOAPIFY_API_KEY
ENV VITE_GEOAPIFY_API_KEY=${VITE_GEOAPIFY_API_KEY}

# Gera a pasta dist/
RUN npm run build

# ---- Runtime (Nginx) ----
FROM nginx:1.27-alpine

# SPA fallback
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia a build gerada
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx","-g","daemon off;"]
