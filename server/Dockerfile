FROM node:latest
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
#EXPOSE 28081
#COPY . .
#COPY . /usr/src/app  # using `volumes` in docker-compose.yml instead of this
#EXPOSE 3000  # no need since this is in the compose file
#CMD ["npm", "start"]  # no need since this is in the compose file