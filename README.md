# Installation
- make sure to remove any "package-lock.json" files
- sudo chmod 755 deployment_scripts/add_user.sh
- comment out `app.use(forceSSL);` in `app.js`
- sudo docker-compose up
- only for first installtion, to get HTTPS certificates run the script register (change it first with --dry-run to avoid being blocked by let'sencrypt):

```
docker exec -it certbot bash
root@05b095690414:/scripts# bash /scripts/register DOMAIN_NAME
```

- if everything is successful (not in dry-run) then uncomment `app.use(forceSSL);` in `app.js`

# mozilla_express_tutorial

https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs

# React Routing Tutorial

https://trello.com/c/NIJOq9aT/124-creating-a-single-page-app-with-react-router
