FROM node:22-alpine

# Install Openclaw globally
RUN npm install -g openclaw@latest

# Create workspace directories
RUN mkdir -p /root/.openclaw /root/openclaw/workspace

WORKDIR /root

EXPOSE 18789

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s \
  CMD wget -q --spider http://localhost:18789 || exit 1

CMD ["openclaw", "gateway", "--port", "18789"]
