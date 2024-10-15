# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copy only package files to leverage caching
COPY package*.json ./
RUN npm install

# Copy the rest of your application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the TypeScript code
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Copy the built files from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./  

# Install production dependencies
RUN npm install --only=production

# Copy Prisma Client from the build stage
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# Expose the port your app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
