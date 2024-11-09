# Stage 1: Build the application
FROM node:20.18-alpine AS build

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

ARG DB_USER
ARG DB_PASSWORD
ARG DB_HOST
ARG DB_PORT
ARG DB_DATABASE
ARG IS_BUILD

ENV DB_USER=$DB_USER
ENV DB_PASSWORD=$DB_PASSWORD
ENV DB_HOST=$DB_HOST
ENV DB_PORT=$DB_PORT
ENV DB_DATABASE=$DB_DATABASE
ENV IS_BUILD=true

# Copy project files and build the app
COPY . .
RUN npm run build

# Stage 2: Set up a production server
FROM node:20.18-alpine

WORKDIR /app

# Install production dependencies
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Copy build files from the build stage
COPY --from=build /app ./

ENV PORT=4321
ENV HOST=0.0.0.0

# Expose the app's port
EXPOSE 4321

# Start the server
ENTRYPOINT ["node", "./dist/server/entry.mjs"]
