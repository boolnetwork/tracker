FROM node:14

ADD . /usr/src/node/server/

WORKDIR /usr/src/node/server/

RUN yarn install --registry https://registry.npmmirror.com

CMD [ "sh", "-c", "node .build/index.js" ]
