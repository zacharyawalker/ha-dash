ARG BUILD_FROM

# ─── Stage 1: Build the React frontend ───────────────────────────────
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --ignore-scripts
COPY frontend/ ./
RUN npm run build

# ─── Stage 2: Runtime (HA base image) ────────────────────────────────
FROM ${BUILD_FROM}

# Install Python and dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    py3-setuptools

# Install Python packages
COPY backend/requirements.txt /tmp/requirements.txt
RUN pip3 install --no-cache-dir --break-system-packages -r /tmp/requirements.txt

# Copy backend code
COPY backend/ /srv/backend/

# Copy built frontend from stage 1
COPY --from=frontend-build /app/frontend/dist /srv/frontend/dist

# Create data directories
RUN mkdir -p /data/dashboards

# Copy s6-overlay service definitions
COPY rootfs/ /

# Ensure run script is executable
RUN chmod +x /etc/s6-overlay/s6-rc.d/ha-dash/run

# Labels for HA
LABEL \
    io.hass.name="HA Dash" \
    io.hass.description="Free-form drag-and-drop dashboard with 50+ widgets" \
    io.hass.type="addon" \
    io.hass.version="${BUILD_VERSION}"
