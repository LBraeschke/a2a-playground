FROM node:22

# Install dependencies for Playwright, healthcheck, and native module compilation
RUN apt-get update && apt-get install -y curl python3 make g++

COPY Zscaler_Root_CA.crt /usr/local/share/ca-certificates/Zscaler_Root_CA.crt
RUN cat /usr/local/share/ca-certificates/Zscaler_Root_CA.crt >> /etc/ssl/certs/ca-certificates.crt
ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt

ARG USERNAME=node

WORKDIR /app

# Copy all files as root first
COPY . .

# Install npm dependencies and build native modules
RUN npm ci

# Create empty db folder
RUN mkdir -p /app/db && chown ${USERNAME}:${USERNAME} /app/db

# Set environment and switch to non-root user
ENV HOME=/app
USER ${USERNAME}

CMD ["npm", "run", "start"]
