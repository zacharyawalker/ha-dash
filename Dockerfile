ARG BUILD_FROM

# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Runtime with HA base image
FROM ${BUILD_FROM}

# Install Python and pip
RUN apk add --no-cache python3 py3-pip

# Install Python dependencies
COPY backend/requirements.txt /tmp/requirements.txt
RUN pip3 install --no-cache-dir --break-system-packages -r /tmp/requirements.txt

# Copy backend
COPY backend/ /srv/backend/

# Copy built frontend from stage 1
COPY --from=frontend-build /app/frontend/dist /srv/frontend/dist

# Copy s6-overlay service definitions
COPY rootfs/ /
RUN chmod +x /etc/s6-overlay/s6-rc.d/ha-dash/run
