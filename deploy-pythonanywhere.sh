#!/bin/bash

source /home/overklok/.bashrc

GIT_WORK_TREE=/home/overklok/tapanda/ch-board/jsapp git checkout -f

cd /home/overklok/tapanda/ch-board/jsapp

npm install
npm run build

# For PythonAnywhere servers
cp /home/overklok/tapanda/ch-board/jsapp/dist/bundle.js /home/overklok/tapanda/ch-board/srv-main/frontend/static/frontend/app/js/
cp /home/overklok/tapanda/ch-board/jsapp/dist/admin_blockly.js /home/overklok/tapanda/ch-board/srv-main/coursesvc/static/admin/vendor/admin-blockly/js/
cp /home/overklok/tapanda/ch-board/jsapp/dist/admin_board.js /home/overklok/tapanda/ch-board/srv-main/coursesvc/static/admin/vendor/admin-board/js/

workon ch-board-srv-main

python /home/overklok/tapanda/ch-board/srv-main/manage.py collectstatic --no-input
touch /var/www/board_tapanda_ru_wsgi.py

deactivate

# hooks/post-receive (+x):

# #!/bin/bash
# mkdir -p /home/overklok/tapanda/ch-board/jsapp
# GIT_WORK_TREE=/home/overklok/tapanda/ch-board/jsapp git checkout -f
# chmod +x /home/overklok/tapanda/ch-board/jsapp/deploy-pythonanywhere.sh
# /home/overklok/tapanda/ch-board/jsapp/deploy-pythonanywhere.sh
