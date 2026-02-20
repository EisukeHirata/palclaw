FROM node:22

# Force all GitHub git references to use HTTPS (no SSH key needed)
RUN git config --global url."https://github.com/".insteadOf "ssh://git@github.com/" && \
    git config --global url."https://github.com/".insteadOf "git@github.com:"

# Install Openclaw globally
RUN npm install -g openclaw@latest && \
    npm cache clean --force

# Create all workspace directories that openclaw expects
RUN mkdir -p /root/.openclaw/agents/main/agent \
             /root/.openclaw/agents/main/sessions \
             /root/.openclaw/credentials \
             /root/.openclaw/logs \
             /root/openclaw/workspace && \
    chmod 700 /root/.openclaw

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

WORKDIR /root

EXPOSE 18789

CMD ["/entrypoint.sh"]
