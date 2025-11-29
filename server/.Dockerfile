# Use the official Node.js image (Alpine is lighter)
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (optimizes caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# build step 
RUN npm run build

# Expose the port your backend runs on (e.g., 5000)
EXPOSE 5000

# Command to run the application
CMD ["npm", "start"]