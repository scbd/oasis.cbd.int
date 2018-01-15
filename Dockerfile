FROM node:8.4.0
# -alpine
# RUN apk update && apk upgrade && \
#     apk add --no-cache bash git

ARG BRANCH='master'
ENV BRANCH $BRANCH

ARG VERSION
ENV VERSION $VERSION

RUN echo 'running on branch ' $VERSION

WORKDIR /usr/src/app

COPY package.json bower.json .bowerrc ./

RUN npm install -q

COPY . ./

ENV PORT 8000

EXPOSE 8000

ARG TAG
ENV TAG $TAG

ARG COMMIT
ENV COMMIT $COMMIT

CMD [ "node", "server" ]
