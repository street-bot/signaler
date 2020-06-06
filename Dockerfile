FROM node:14-alpine as build

WORKDIR /tmp/build
COPY ./ ./

RUN npm install && npm run build && npm run copy-files

# ----------------------------------------------------------
FROM node:14-alpine

ARG GIT_SHA
ENV GIT_SHA=${GIT_SHA}

RUN apk add --no-cache dumb-init

WORKDIR /app
COPY --from=build /tmp/build/build /app/
RUN npm install --only=production

ENTRYPOINT [ "dumb-init", "--" ]
CMD [ "node", "index.js" ]