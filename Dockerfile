# ------------------------------
# Builder stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install openssl and ca-certificates for SSL
RUN apk add --no-cache openssl ca-certificates && \
    update-ca-certificates

COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .

# Set environment variables for build stage
ENV MONGO_URI="mongodb+srv://tusharkukwase24_db_user:S2eP3gx4sIwRpGHq@data.buqlnst.mongodb.net/photobook?retryWrites=true&w=majority&appName=Data&ssl=true&tlsAllowInvalidCertificates=false"
ENV ADMIN_EMAIL="tusharkukwase24@gmail.com"
ENV NODE_ENV="production"

RUN npm run build

# ------------------------------
# Runner / Production stage
FROM node:20-alpine
WORKDIR /app

# Install openssl and ca-certificates for SSL support
RUN apk add --no-cache openssl ca-certificates && \
    update-ca-certificates

COPY --from=builder /app ./

# Production dependencies
RUN npm install --production --legacy-peer-deps

# Runtime environment variables
ENV MONGO_URI="mongodb+srv://tusharkukwase24_db_user:S2eP3gx4sIwRpGHq@data.buqlnst.mongodb.net/photobook?retryWrites=true&w=majority&AppName=Data&ssl=true&tlsAllowInvalidCertificates=false"
ENV ADMIN_EMAIL="tusharkukwase24@gmail.com"
ENV NODE_ENV="production"
ENV PORT="10000"

EXPOSE 10000
CMD ["npm", "start"]