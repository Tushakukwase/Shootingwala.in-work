# FROM node:20-alpine AS builder
# WORKDIR /app

# COPY package*.json ./
# RUN npm install --legacy-peer-deps

# COPY . .
# RUN npm run build

# FROM node:20-alpine
# WORKDIR /app

# COPY --from=builder /app ./

# ENV NODE_ENV=production
# RUN npm install --production --legacy-peer-deps

# EXPOSE 3000
# CMD ["npm", "start"]


# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy all project files
COPY . .

# Copy .env file so Next.js can access environment variables during build
# (Use only if it's safe, otherwise use build args or Render env vars)
COPY .env .env

# Build the Next.js app
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

# Copy built files from builder
COPY --from=builder /app ./

# Set production environment
ENV NODE_ENV=production

# If you want to pass MONGO_URI from host/Render instead of copying .env
# uncomment these lines:
# ARG MONGO_URI
# ENV MONGO_URI=$MONGO_URI

# Install only production dependencies
RUN npm install --production --legacy-peer-deps

EXPOSE 3000

# Start the app
CMD ["npm", "start"]
