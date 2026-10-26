
# Use an official Node.js runtime.
FROM node:22-alpine

# Work inside /app in the container.
WORKDIR /app

# Install dependencies first for efficient build caching.
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the application.
COPY . .

# Document the port used by Express.
ENV PORT=3000
EXPOSE 3000

# Start the application.
CMD ["npm", "start"]
