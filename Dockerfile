FROM node:14-slim
WORKDIR /usr/src/app
COPY . .
RUN npm install && npm run build:prod
ENTRYPOINT [ "npm", "run" , "start:prod" ]
