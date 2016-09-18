sudo su
echo "Downloading Heinrich"
rpm -Uvh https://rpm.nodesource.com/pub_4.x/el/7/x86_64/nodesource-release-el7-1.noarch.rp
yum install git nodejs -y
git clone https://github.com/GavinDmello/heinrich.git
echo "Installing dependancies"
cd heinrich
npm i
echo "Installed dependancies, Now use start.sh to start the server after modifying the config.json file"

