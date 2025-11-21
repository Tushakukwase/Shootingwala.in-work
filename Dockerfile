# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

ARG MONGO_URI
ENV MONGO_URI=$MONGO_URI

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Copy built app from builder
COPY --from=builder /app ./

# Set runtime environment
ENV NODE_ENV=production

# Install only production dependencies
RUN npm install --production --legacy-peer-deps

EXPOSE 3000

# Start the app
CMD ["npm", "start"]
