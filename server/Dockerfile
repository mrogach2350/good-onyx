FROM node:18-bookworm AS base

FROM base as builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM base as runner
COPY --from=builder /app/dist ./

# Install Playwright and its dependencies
RUN npx -y playwright@1.49.1 install firefox --with-deps

CMD ["node", "index.ts"]
