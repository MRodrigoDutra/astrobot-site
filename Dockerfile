# Servidor estático
FROM nginx:1.27-alpine

# Copia a build pronta
COPY dist /usr/share/nginx/html

# SPA fallback: garante que rotas do React funcionem (sempre devolve index.html)
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
