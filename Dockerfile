# ---------- Build Stage ----------
FROM node:20 AS builder
WORKDIR /app

# Pass MongoDB URI as build arg and set as env variable
ARG MONGO_URI
ENV MONGO_URI=$MONGO_URI

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy all project files
COPY . .

# Build the Next.js app
RUN npm run build

# ---------- Production Stage ----------
FROM node:20
WORKDIR /app

# Copy built app from builder stage
COPY --from=builder /app ./

# Set production environment
ENV NODE_ENV=production
ENV MONGO_URI=$MONGO_URI

# Install only production dependencies
RUN npm install --production --legacy-peer-deps

# Expose the port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
