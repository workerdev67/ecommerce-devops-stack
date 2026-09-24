FROM node:22-alpine

WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

RUN npm ci --only=production

# Copy rest of the application code
COPY . .

# Expose your app port (e.g., 5000)
EXPOSE 5000

# Fixed quotes syntax and typo in path ("src/server.js")
CMD ["node", "src/server.js"]