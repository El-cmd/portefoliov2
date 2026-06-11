FROM node:22-bookworm-slim AS base

WORKDIR /opt/app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 1337

FROM base AS dev

CMD ["npm", "run", "develop"]

FROM base AS prod

ENV NODE_ENV=production

RUN npm run build

CMD ["npm", "run", "start"]
