#!/bin/sh

# parameter $1 - DOMAIN_NAME

# to run 
#   attach to the container using 'sudo docker exec -it certbot bash'
#   then 'bash register.sh DOMAIN_NAME'

# NOT A DRY-RUN!
/scripts/certbot-auto certonly --webroot -w /webroots/$1 -d $1

# for DRY-RUN use:
# --dry-run - use this flag to avoid being blocked by let'sencrypt
# --debug-challenges - another useful flag to use is which wait for approval before continuing to validate
# this is good for checking that the challenge file was written by certbot inside the folder  /webroots/DOMAIN_NAME/.well-known/
#/scripts/certbot-auto certonly --dry-run --debug-challenges --webroot -w /webroots/$1 -d $1