FROM node:18-alpine

# better-sqlite3 compiles a native addon on install
RUN apk add --no-cache python3 make g++

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install --omit=dev

COPY backend/ ./
COPY frontend/ ../frontend/

RUN mkdir -p uploads database

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
