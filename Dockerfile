FROM node:alpine as build-deps
WORKDIR /opt/tapanda

COPY package.json package-lock.json .env babel.config.js tsconfig.json webpack.config.js ./

RUN npm install
COPY src ./src
RUN npm run build