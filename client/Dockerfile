FROM node:latest
WORKDIR /usr/src/app
COPY package*.json ./
# pass the $CERT_PATH arg as env var
# RUN echo "${CERT_PATH}"
# RUN ls -al
# RUN ls -al /etc/letsencrypt
# RUN ls -al /etc/letsencrypt/archive/
# RUN ls -al ${CERT_PATH}
# RUN printenv
# COPY ${CERT_PATH} ./node_modules/webpack-dev-server/ssl/server.pem
RUN npm install
ARG CERT_PATH
ENV CERT_PATH $CERT_PATH
#EXPOSE 3000
#COPY . .
#COPY . /usr/src/app  # using `volumes` in docker-compose.yml instead of this
#EXPOSE 3000  # no need since this is in the compose file
#CMD ["npm", "start"]  # no need since this is in the compose file