FROM node:16.15.0 AS builder

RUN apt update
RUN apt install dumb-init

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install

COPY . .

RUN yarn run build

FROM node:16.15.0-slim AS production

WORKDIR /app

COPY --from=builder /usr/bin/dumb-init /usr/bin/dumb-init
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD [ "node", "dist/main"]