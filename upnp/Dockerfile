FROM debian:jessie

# Inspiration:
# https://hub.docker.com/r/gaafar/cron/

# Install cron, certbot, bash, plus any other dependencies
RUN apt-get update \
   && apt-get install -y cron bash miniupnpc

RUN mkdir /scripts
WORKDIR /scripts
COPY update_upnp .
RUN chmod a+x ./update_upnp

# Create the log file to be able to run tail
RUN touch /var/log/renew-cron.log
RUN chmod 755 /var/log/renew-cron.log

#COPY renew-cron .
RUN echo "*/10 * * * * root echo \"[$(date)] heartbeat\" >> /var/log/renew-cron.log 2>&1" >> /etc/crontab
RUN echo "*/10 * * * * root bash /scripts/update_upnp 80 TCP >> /var/log/renew-cron.log 2>&1" >> /etc/crontab
RUN echo "*/10 * * * * root bash /scripts/update_upnp 443 TCP >> /var/log/renew-cron.log 2>&1" >> /etc/crontab
# An empty line is required at the end of this file for a valid cron file.
RUN echo "#" >> /etc/crontab
#RUN cat /etc/crontab

# on start, open needed ports, start cron jobs and print output
ENTRYPOINT bash update_upnp 80 TCP && bash update_upnp 443 TCP && cron && tail -f /var/log/renew-cron.log