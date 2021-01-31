FROM node:14-slim
WORKDIR /usr/src/app
COPY . .
RUN npm install
ENTRYPOINT [ "npm", "run" , "start" ]
