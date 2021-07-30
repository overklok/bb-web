#!/bin/bash

source /home/overklok/.bashrc

GIT_WORK_TREE=/home/overklok/tapanda/ch-board/jsapp git checkout -f

cd /home/overklok/tapanda/ch-board/jsapp

npm install
npm run build

# For PythonAnywhere servers

# srv-main
cd /home/overklok/tapanda/ch-board/srv-main/app || exit

cp -r /home/overklok/tapanda/ch-board/jsapp/dist/fonts    ./tapanda/apps/frontend/static/frontend/app/fonts/
cp /home/overklok/tapanda/ch-board/jsapp/dist/main.js     ./tapanda/apps/frontend/static/frontend/app/
cp /home/overklok/tapanda/ch-board/jsapp/dist/main.css    ./tapanda/apps/frontend/static/frontend/app/
cp /home/overklok/tapanda/ch-board/jsapp/dist/blockly.js  ./tapanda/apps/courses/static/admin/vendor/admin-blockly/blockly.js
cp /home/overklok/tapanda/ch-board/jsapp/dist/blockly.css ./tapanda/apps/courses/static/admin/vendor/admin-blockly/blockly.css
cp /home/overklok/tapanda/ch-board/jsapp/dist/board.js    ./tapanda/apps/courses/static/admin/vendor/admin-board/board.js
cp /home/overklok/tapanda/ch-board/jsapp/dist/board.css   ./tapanda/apps/courses/static/admin/vendor/admin-board/board.css

# srv-main
workon bb-srv-main
cd /home/overklok/tapanda/ch-board/srv-main/app || exit
python manage.py collectstatic --no-input
touch /var/www/board_tapanda_ru_wsgi.py
deactivate

# hooks/post-receive (+x):

# #!/bin/bash
# mkdir -p /home/overklok/tapanda/ch-board/jsapp
# GIT_WORK_TREE=/home/overklok/tapanda/ch-board/jsapp git checkout -f
# chmod +x /home/overklok/tapanda/ch-board/jsapp/deploy-pythonanywhere.sh
# /home/overklok/tapanda/ch-board/jsapp/deploy-pythonanywhere.sh
