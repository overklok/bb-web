#!/bin/bash

source /home/overklok/.bashrc

GIT_WORK_TREE=/home/overklok/tapanda/ch-board/jsapp git checkout -f

cd /home/overklok/tapanda/ch-board/jsapp

npm install
npm run build

# For PythonAnywhere servers

# srv-main
cp /home/overklok/tapanda/ch-board/jsapp/dist/bundle.js /home/overklok/tapanda/ch-board/srv-main/frontend/static/frontend/app/js/
cp /home/overklok/tapanda/ch-board/jsapp/dist/admin_blockly.js /home/overklok/tapanda/ch-board/srv-main/coursesvc/static/admin/vendor/admin-blockly/js/
cp /home/overklok/tapanda/ch-board/jsapp/dist/admin_board.js /home/overklok/tapanda/ch-board/srv-main/coursesvc/static/admin/vendor/admin-board/js/

# srv-alpha1
cp /home/overklok/tapanda/ch-board/jsapp/dist/bundle.js /home/overklok/tapanda/ch-board/srv-alpha1/frontend/static/frontend/app/js/
cp /home/overklok/tapanda/ch-board/jsapp/dist/admin_blockly.js /home/overklok/tapanda/ch-board/srv-alpha1/coursesvc/static/admin/vendor/admin-blockly/js/
cp /home/overklok/tapanda/ch-board/jsapp/dist/admin_board.js /home/overklok/tapanda/ch-board/srv-alpha1/coursesvc/static/admin/vendor/admin-board/js/

# srv-alpha2
cp /home/overklok/tapanda/ch-board/jsapp/dist/bundle.js /home/overklok/tapanda/ch-board/srv-alpha2/frontend/static/frontend/app/js/
cp /home/overklok/tapanda/ch-board/jsapp/dist/admin_blockly.js /home/overklok/tapanda/ch-board/srv-alpha2/coursesvc/static/admin/vendor/admin-blockly/js/
cp /home/overklok/tapanda/ch-board/jsapp/dist/admin_board.js /home/overklok/tapanda/ch-board/srv-alpha3/coursesvc/static/admin/vendor/admin-board/js/

# srv-alpha3
cp /home/overklok/tapanda/ch-board/jsapp/dist/bundle.js /home/overklok/tapanda/ch-board/srv-alpha3/frontend/static/frontend/app/js/
cp /home/overklok/tapanda/ch-board/jsapp/dist/admin_blockly.js /home/overklok/tapanda/ch-board/srv-alpha3/coursesvc/static/admin/vendor/admin-blockly/js/
cp /home/overklok/tapanda/ch-board/jsapp/dist/admin_board.js /home/overklok/tapanda/ch-board/srv-alpha3/coursesvc/static/admin/vendor/admin-board/js/

# srv-main
workon ch-board-srv-main
python /home/overklok/tapanda/ch-board/srv-main/manage.py collectstatic --no-input
touch /var/www/board_tapanda_ru_wsgi.py
deactivate

# srv-alpha1
workon ch-board-srv-alpha1
python /home/overklok/tapanda/ch-board/srv-alpha1/manage.py collectstatic --no-input
touch /var/www/alpha1_tapanda_ru_wsgi.py
deactivate

# srv-alpha2
workon ch-board-srv-alpha2
python /home/overklok/tapanda/ch-board/srv-alpha2/manage.py collectstatic --no-input
touch /var/www/alpha2_tapanda_ru_wsgi.py
deactivate

# srv-alpha3
workon ch-board-srv-alpha3
python /home/overklok/tapanda/ch-board/srv-alpha3/manage.py collectstatic --no-input
touch /var/www/alpha3_tapanda_ru_wsgi.py
deactivate

# hooks/post-receive (+x):

# #!/bin/bash
# mkdir -p /home/overklok/tapanda/ch-board/jsapp
# GIT_WORK_TREE=/home/overklok/tapanda/ch-board/jsapp git checkout -f
# chmod +x /home/overklok/tapanda/ch-board/jsapp/deploy-pythonanywhere.sh
# /home/overklok/tapanda/ch-board/jsapp/deploy-pythonanywhere.sh
