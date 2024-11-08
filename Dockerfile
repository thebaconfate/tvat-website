# Stage 1: Build the application
FROM node:20.18-alpine AS build

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy project files and build the app
COPY . .
RUN npm run build

# Stage 2: Set up a production server
FROM node:20.18-alpine

WORKDIR /app

# Install production dependencies
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy build files from the build stage
COPY --from=build /app ./

# Expose the app's port
EXPOSE 4321

# Start the server
ENTRYPOINT ["node", "./dist/server/entry.mjs"]
