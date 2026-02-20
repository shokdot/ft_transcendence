FROM node:20 AS base
WORKDIR /apps

# Stage 1: Build core only once
FROM base AS core-builder
COPY core/package*.json core/
COPY core/tsconfig.json core/
COPY core/src core/src
WORKDIR /apps/core
RUN npm install && npm run build

# Stage 2: Service-specific build stage
FROM base AS service-builder
ARG SERVICE_NAME

# Increase npm connection resilience
RUN npm config set fetch-retries 10 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Copy only base dependencies first to improve caching across services if possible
# (Though in this structure each service has its own package.json)
WORKDIR /apps/${SERVICE_NAME}
COPY ${SERVICE_NAME}/package*.json ./

# RUN npm install before copying the rest of the source to leverage cache
RUN npm install --no-audit --no-fund --ignore-scripts

# Reuse core build (moved after npm install to keep service-specific layers smaller)
COPY --from=core-builder /apps/core /apps/core

# Copy optional configuration files
COPY ${SERVICE_NAME}/prisma.config.ts* ./
COPY ${SERVICE_NAME}/tsup.config.ts* ./
COPY ${SERVICE_NAME}/tsconfig.json ./
# Copy prisma if it exists
COPY ${SERVICE_NAME}/prisma* ./prisma/
COPY ${SERVICE_NAME}/src ./src

RUN npm run build

# Stage 3: Dynamic Runner Stage
FROM node:20-alpine AS runner
ARG SERVICE_NAME
ARG PORT=3000

ENV NODE_ENV=production
WORKDIR /apps

# Copy build artifacts
COPY --from=core-builder /apps/core/dist core/dist
COPY --from=service-builder /apps/${SERVICE_NAME}/dist ${SERVICE_NAME}/dist
COPY --from=service-builder /apps/${SERVICE_NAME}/package*.json ${SERVICE_NAME}/
COPY --from=service-builder /apps/${SERVICE_NAME}/prisma.config.ts* ${SERVICE_NAME}/
# Optional prisma copy
COPY --from=service-builder /apps/${SERVICE_NAME}/prisma* ${SERVICE_NAME}/prisma/

WORKDIR /apps/${SERVICE_NAME}
RUN npm install --omit=dev

EXPOSE ${PORT}
CMD ["npm", "run", "start"]
