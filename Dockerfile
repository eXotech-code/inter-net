FROM node:14

COPY . /data

WORKDIR /data

RUN npm install && npm run build-stylesheet

EXPOSE 8080

CMD ["npm", "run", "start-dev"]
