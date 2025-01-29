###################
# DEVELOPMENT
###################
FROM node:20-alpine AS development

# Install development tools
RUN apk add --no-cache python3 make g++ dumb-init

WORKDIR /usr/src/app

# Copy dependency files
COPY package*.json ./

# Install ALL dependencies (including devDependencies)
RUN npm ci && npm cache clean --force

# Copy source
COPY . .

# Use dumb-init and start in development mode
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start:dev"]

###################
# BUILD FOR PRODUCTION
###################
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

COPY . .

# Build and prune dev dependencies
RUN npm run build && \
    npm ci --omit=dev && \
    npm cache clean --force

###################
# PRODUCTION
###################
FROM node:20-alpine AS production

RUN apk add --no-cache dumb-init && \
    addgroup -g 1001 nodejs && \
    adduser -S -u 1001 -G nodejs nodejs

WORKDIR /usr/src/app

COPY --from=builder --chown=nodejs:nodejs /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /usr/src/app/dist ./dist
COPY --chown=nodejs:nodejs package*.json ./
COPY --chown=nodejs:nodejs tsconfig*.json ./

ENV NODE_ENV=production
ENV PORT=3000

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -q --spider http://localhost:3000/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD [ "node", "dist/main.js" ]