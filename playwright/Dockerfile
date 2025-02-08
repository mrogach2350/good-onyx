FROM mcr.microsoft.com/playwright:v1.50.1-noble AS base

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Install Playwright and its dependencies
# RUN npx -y playwright@1.49.1 install firefox --with-deps

CMD ["node", "./dist/src/index.js"]
