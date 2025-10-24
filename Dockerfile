# Stage 1: Build the application
FROM node:24-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json  ./
COPY astro.config.* ./

RUN npm ci

# Copy project files and build the app
COPY . .

RUN npm run build

# Stage 2: Set up a production server
FROM node:24-alpine

WORKDIR /app

# Install production dependencies
COPY package*.json  ./

RUN npm ci --omit=dev

# Copy build files from the build stage
COPY --from=build /app/dist ./dist
COPY astro.config.* ./

# Overrides default port (even though default is 4312)
ENV PORT=4321

# Required for astro applications. Otherwise it listens to localhost which won't
# be exposed in a container
ENV HOST=0.0.0.0

# Expose the app's port
EXPOSE 4321

# Start the server
ENTRYPOINT ["node", "./dist/server/entry.mjs"]
