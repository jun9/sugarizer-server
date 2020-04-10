apt update
apt install -y git
git clone https://github.com/llaske/sugarizer
git clone https://github.com/llaske/sugarizer-server
curl -fsSL https://get.docker.com/ | sh
curl -L "https://github.com/docker/compose/releases/download/1.8.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
cd sugarizer-server
touch testing.js
sh generate-docker-compose.sh
sleep 30s
docker-compose up -d
