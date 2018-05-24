FROM xuntian/node:10.1-npm-5.6-yarn-1.6
MAINTAINER Xuntian "li.zq@foxmail.com"

COPY ./ /code/
WORKDIR /code

ARG BUILD_ENV
# RUN yarn config set registry http://registry.npm.taobao.org/
# RUN yarn install --ignore-optional
RUN NODE_ENV=${BUILD_ENV} TZ=Asia/Shanghai yarn build

CMD yarn production
