FROM node:14-alpine

ADD . /usr/src/node/server/

WORKDIR /usr/src/node/server/

EXPOSE 3000

CMD [ "sh", "-c", "node ./build/index.js" ]
