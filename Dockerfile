FROM node:22.0
# -alpine
# RUN apk update && apk upgrade && \
#     apk add --no-cache bash git

ARG BRANCH='master'
ENV BRANCH=$BRANCH

ARG COMMIT
ENV COMMIT=$COMMIT

ARG TAG
ENV TAG=$TAG

RUN echo 'running on branch ' $BRANCH 'tag:' $TAG 'commit:' $COMMIT

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

ENV PORT=8000

EXPOSE 8000


CMD [ "node", "server" ]
