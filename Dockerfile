# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies needed for bcrypt compilation
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Temporarily disable husky install
ENV HUSKY=0

# Install dependencies including dev dependencies
RUN npm ci --ignore-scripts

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies and source code
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build TypeScript code with path aliases
RUN npm run build && \
    # Update module aliases in package.json for production
    node -e "const pkg=require('./package.json'); pkg._moduleAliases={'@':'dist'}; require('fs').writeFileSync('package.json',JSON.stringify(pkg,null,2));"
# Copy module-alias configuration to dist
RUN cp package.json dist/

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app

# Create a non-root user and set up logging directory
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup && \
    mkdir -p /var/log/jal-shakti/logs && \
    chown -R appuser:appgroup /var/log/jal-shakti && \
    chmod -R 755 /var/log/jal-shakti

# Copy only production dependencies
COPY --from=deps /app/package*.json ./

# Disable husky and install production dependencies
ENV HUSKY=0
RUN npm ci --omit=dev --ignore-scripts

# Copy build output and other necessary files
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/.env* ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Switch to non-root user
USER appuser

# Expose application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "dist/server.js"]
