# Stage 1: Build the application
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
# all deps, including dev, so tsc works
RUN npm install

COPY . .
# compiles TypeScript into dist
RUN npm run build

# Stage 2: Create the final production image
FROM node:22-alpine AS runner
ENV CONTAINER_ENV=docker

WORKDIR /usr/src/app

# Copy only necessary files from the builder stage
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/app-controller.js"]