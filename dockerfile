# Base image
FROM node:18.12-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project directory (excluding node_modules)
COPY . .

# Build the client-side code (if necessary)
# Replace with your specific build command (e.g., npm run build)
RUN npm run build

# Expose port for the Express.js server
EXPOSE 3000

# Base image for the running container
FROM node:18.12-alpine

# Set working directory
WORKDIR /app

# Copy the production-ready code (excluding node_modules)
COPY --from=builder /app .

# Start the Express.js server with WebSockets enabled
CMD ["npm", "start"]
