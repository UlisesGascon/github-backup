# Stage-1 dependencies
FROM node:17.2.0 as dependencies
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm i --only=production

# Stage-2 final image
FROM node:17.2.0-alpine
RUN apk update && apk add git gnupg
WORKDIR /app
RUN chown -R node:node /app
USER node
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY package*.json ./
COPY /src ./src
RUN mkdir logs

CMD [ "npm", "start" ]