# Build l'app Vite, puis sert le build de production avec `vite preview`.
FROM node:22-alpine

WORKDIR /app

# VITE_API_URL est injectée au build (le navigateur tourne sur l'hôte et doit
# joindre l'API via le port mappé, pas le hostname Docker interne).
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "preview", "--", "--host", "--port", "3000"]
