FROM xuntian/node-yarn
COPY ./ /code/
WORKDIR /code

# copy config.js to overwrite the default config

ARG BUILD_ENV
RUN yarn config set registry https://registry.npm.taobao.org/
RUN yarn install --ignore-optional
RUN NODE_ENV=${BUILD_ENV} TZ=Asia/Shanghai yarn build

CMD yarn production
