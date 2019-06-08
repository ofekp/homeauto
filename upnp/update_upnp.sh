#!/bin/bash

port=$1
protocol=$2
echo "Updating UPnP entry with port [$port] and protocol [$protocol]"

gateway=$(ip route | head -1 | awk '{print $3}')
echo "Detected gateway is [$gateway]"

# port - e.g. 80
# protocol - TCP or UDP
upnpc -e 'home-sensei' -r $port $protocol

echo "Done updating UPnP entry with port [$port] and protocol [$protocol]"   