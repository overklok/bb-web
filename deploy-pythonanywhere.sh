#!/bin/bash
touch itworks.txt

source /home/overklok/.bashrc

git checkout -f
git pull

npm run build

# For PythonAnywhere servers
cp ./dist/index.js ../srv-main/frontend/static/frontend/app/js/
cp ./dist/admin_blockly.js ../srv-main/coursesvc/static/admin/vendor/admin-blockly/js/
cp ./dist/admin_board.js ../srv-main/coursesvc/static/admin/vendor/admin-board/js/

cd ../srv-main
workon ch-board-srv-main

python ./manage.py collectstatic --no-input
touch /var/www/board_tapanda_ru_wsgi.py

deactivate

# hooks/post-receive (+x):

# #!/bin/bash
# mkdir -p /home/overklok/tapanda/ch-board/jsapp
# GIT_WORK_TREE=/home/overklok/tapanda/ch-board/jsapp git checkout -f
# chmod +x /home/overklok/tapanda/ch-board/jsapp/deploy-pythonanywhere.sh
# /home/overklok/tapanda/ch-board/jsapp/deploy-pythonanywhere.sh
# exit(0);
