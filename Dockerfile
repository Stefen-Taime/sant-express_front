FROM node:20-alpine as build-stage

WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY babel.config.js ./
COPY postcss.config.js ./
COPY tailwind.config.js ./
COPY jsconfig.json ./

# Installer les dépendances
RUN npm install

# Copier les fichiers du projet
COPY . .

# Construire l'application pour la production
RUN npm run build

# Étape de production
FROM nginx:stable-alpine as production-stage

# Copier les fichiers de build depuis l'étape précédente
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Configurer nginx pour les applications SPA
RUN echo '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1.0"><link rel="icon" href="/favicon.ico"><title>SanteExpress</title></head><body><noscript><strong>We'\''re sorry but this app doesn'\''t work properly without JavaScript enabled. Please enable it to continue.</strong></noscript><div id="app"></div></body></html>' > /usr/share/nginx/html/404.html

# Copier la configuration nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]