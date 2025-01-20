FROM node:20-alpine

LABEL org.opencontainers.image.title="r/Splatoon Profile" \
      org.opencontainers.image.description="Profiles for r/Splatoon users" \
      org.opencontainers.image.authors="@shane on Discord"

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY . .

USER node

COPY --chown=node:node . .

RUN npm install
RUN { npm audit fix || true; }
RUN npm run build
RUN rm -rf ./node_modules
RUN npm install --only=prod

ENTRYPOINT ["node", "server.js"]