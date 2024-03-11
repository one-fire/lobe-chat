#!/bin/bash
function parse_json() {
  echo "${1//\"/}" | sed "s/.*$2:\([^,}]*\).*/\1/"
}
a=$(cat ./package.json)
value=$(echo $a | sed s/[[:space:]]//g)
version=$(parse_json $value "version")
echo "version: $version"

rsync -avr --exclude=node_modules --exclude=.next --exclude=.git --exclude=.env --delete-after . RTC:/root/site/lobe-chat

ssh RTC "cd /root/site/lobe-chat && pnpm install && pnpm build && pm2 restart lobe-chat"

# pm2 start ecosystem.config.js
