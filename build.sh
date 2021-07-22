rm -rf dist
mkdir dist
docker-compose up --build
docker-compose rm -svf