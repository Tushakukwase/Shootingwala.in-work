# ------------------------------
# Builder stage
FROM node:20-alpine AS builder
WORKDIR /app

# TLS/SSL support ke liye openssl install karo
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .

# Set environment variables for build stage
ENV MONGO_URI="mongodb+srv://tusharkukwase24_db_user:S2eP3gx4sIwRpGHq@data.buqlnst.mongodb.net/photobook?retryWrites=true&w=majority&appName=Data"
ENV ADMIN_EMAIL="tusharkukwase24@gmail.com"
ENV NODE_ENV="production"

RUN npm run build

# ------------------------------
# Runner / Production stage
FROM node:20-alpine
WORKDIR /app

# TLS/SSL support ke liye openssl install karo
RUN apk add --no-cache openssl

COPY --from=builder /app ./

# Production dependencies
RUN npm install --production --legacy-peer-deps

# Runtime environment variable for MongoDB
ENV MONGO_URI="mongodb+srv://tusharkukwase24_db_user:S2eP3gx4sIwRpGHq@data.buqlnst.mongodb.net/photobook?retryWrites=true&w=majority&appName=Data"
ENV ADMIN_EMAIL="tusharkukwase24@gmail.com"
ENV NODE_ENV="production"

EXPOSE 3000
CMD ["npm", "start"]