FROM node:lts-slim
ENV APP_PATH /usr/app

WORKDIR ${APP_PATH}
COPY ["package.json", "yarn.lock*", "package-lock.json*", "npm-shrinkwrap.json*", "./"]

ENV PATH ${APP_PATH}/node_modules/.bin:$PATH
COPY . .

RUN yarn
EXPOSE 5000

RUN apt-get update && apt-get install -y wait-for-it
CMD yarn dev
