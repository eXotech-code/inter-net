FROM centos
COPY . /data

WORKDIR /data

RUN dnf update -y && dnf module enable nodejs:12 -y && dnf install nodejs -y
RUN npm install

EXPOSE 8080
CMD ["npm", "start"]
