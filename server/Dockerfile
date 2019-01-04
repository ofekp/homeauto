FROM node:latest
WORKDIR /usr/src/app

# let's encrypt
RUN git clone https://git.coolaj86.com/coolaj86/greenlock-express.js.git
RUN cd greenlock-express.js
RUN npm install
RUN cd ..
# folder to save the certificates
RUN mkdir certs
RUN chmod -R 777 certs

COPY package*.json ./
RUN npm install
#EXPOSE 28081
#COPY . .
#COPY . /usr/src/app  # using `volumes` in docker-compose.yml instead of this
#EXPOSE 3000  # no need since this is in the compose file
#CMD ["npm", "start"]  # no need since this is in the compose file