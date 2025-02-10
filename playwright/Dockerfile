FROM mcr.microsoft.com/playwright:v1.50.1-focal

# Install additional dependencies that might be needed
RUN apt-get update && \
    apt-get install -y \
    xvfb \
    dbus-x11 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .
RUN npm run build

# Install only Firefox since that's what the service uses
RUN npx playwright install firefox --with-deps

# Expose the port the service runs on
EXPOSE 6666

# Set environment variables for running Firefox in container
ENV DISPLAY=:99
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV FIREFOX_FLAGS="--no-sandbox --headless --disable-gpu"

# Create a non-root user to run the browser
RUN useradd -m playwright
RUN chown -R playwright:playwright /app
USER playwright

CMD ["node", "./dist/src/index.js"]
