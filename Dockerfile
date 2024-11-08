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
EXPOSE 3000

# Start the SSR server using Node.js (Astro's built-in SSR server)
CMD ["npm", "run", "preview"]

