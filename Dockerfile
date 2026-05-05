FROM node:18.0
# -alpine
# RUN apk update && apk upgrade && \
#     apk add --no-cache bash git

ARG BRANCH='master'
ENV BRANCH $BRANCH

ARG GIT_COMMIT
ENV GIT_COMMIT $GIT_COMMIT

RUN echo 'running on branch ' $GIT_COMMIT

WORKDIR /usr/src/app

COPY package.json .npmrc ./

COPY . ./

RUN yarn install --ignore-scripts --prefer-offline && \
    yarn cache clean && \
    rm -rf /usr/src/app/dist \
    rm -fr /usr/share/doc && rm -fr /usr/share/locale && \
    rm -fr /usr/local/share/.cache/yarn && rm -rf /var/cache/apk/* && \
    rm -rf /var/lib/{apt,dpkg,cache,log}/

# run rollup build script 
RUN yarn run build

ENV PORT 8000

EXPOSE 8000

ARG TAG
ENV TAG $TAG

ARG COMMIT
ENV COMMIT $COMMIT

CMD [ "node", "server" ]
