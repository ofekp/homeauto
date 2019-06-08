#!/bin/sh

# echo "Installing NetCat..."
# apk add netcat  # since this is Alpine which is based on Ubuntu 
# echo "NetCat installed."
# echo "Waiting for MongoDB to load..."
# until nc -z mongo 27017
# do
#     sleep 1
# done
# echo "MongoDB is up."

USER_NAME="dbuser"
PASSWORD="mydbdbmy"
MONGO_DATABASE_NAME="db"

until mongo $MONGO_DATABASE_NAME --host mongo --eval "print(\"waited for connection\")"
do
    sleep 2
done

echo "Looking for user in DB..."
#mongo --host mongo --eval "printjson(db.users.find().toArray())"
found_username=$(mongo $MONGO_DATABASE_NAME --host mongo --eval "printjson(db.getUser(\"$USER_NAME\"))" --quiet | grep "$USER_NAME" | head -1)

if test "${found_username#*$USER_NAME}" != "$found_username"
then
    echo "User name [$USER_NAME] found! No need to add a user to the DB."
    exit 0
else
    echo "User name [$USER_NAME] not found!"
fi

echo "Adding user to MongoDB..."
mongo --host mongo $MONGO_DATABASE_NAME --eval "db.createUser({ user: \"$USER_NAME\", pwd: \"$PASSWORD\", roles: [ { role: \"root\", db: \"admin\" } ] });"
echo "User added."