FROM node:20-alpine AS builder
WORKDIR /app

ARG MONGO_URI
ENV MONGO_URI=$MONGO_URI

COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build
