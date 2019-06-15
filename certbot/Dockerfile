# based on https://techsparx.com/nodejs/docker/express-https.html

FROM debian:jessie

# Inspiration:
# https://hub.docker.com/r/gaafar/cron/

# Install cron, certbot, bash, plus any other dependencies
RUN apt-get update \
   && apt-get install -y cron bash wget

ARG DOMAIN
RUN echo 'DOMAIN is [$DOMAIN]'
RUN mkdir -p /webroots/${DOMAIN}/.well-known /scripts

WORKDIR /scripts
RUN wget https://dl.eff.org/certbot-auto
RUN chmod a+x ./certbot-auto
# Run certbot-auto so that it installs itself
RUN /scripts/certbot-auto -n certificates

# TODO: add step to setup after a long time of inactivity
# using:
# ./certbot-auto certificates --cert-name <domain>
# check if the certificate is valid, if not renew
# example for output:
# Expiry Date: 2019-08-26 21:20:58+00:00 (VALID: 89 days)

# register script is needed only on the first time of crtificating a domain
COPY register .
RUN chmod a+x ./register

# /webroots/DOMAIN.TLD/.well-known/... challenge files go here
VOLUME /webroots
VOLUME /etc/letsencrypt

# This installs a Crontab entry which 
# runs "certbot renew" at 03:00 on every 16th day-of-month (twice a month - 1st and 17th)
# Copy renew-cron file to the cron.d directory
COPY renew-cron /etc/cron.d/renew-cron

# Give execution rights on the cron job
RUN chmod 0644 /etc/cron.d/renew-cron

# Apply cron job
RUN crontab /etc/cron.d/renew-cron

# Create the log file to be able to run tail
RUN touch /var/log/cron.log

# Run the command on container startup
CMD cron && tail -f /var/log/cron.log