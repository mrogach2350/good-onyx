FROM node:18-bookworm AS base

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Install Playwright and its dependencies
RUN npx -y playwright@1.49.1 install firefox --with-deps

CMD ["node", "./dist/index.js"]
