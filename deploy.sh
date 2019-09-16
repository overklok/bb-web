#!/bin/bash
source ~/.bashrc

git checkout -f
git pull

npm run build

cp ./app/js/index.js ../srv-main/frontend/static/frontend/app/js/
cp ./app/js/admin_blockly.js ../srv-main/coursesvc/static/admin/vendor/admin-blockly/js/
cp ./app/js/admin_board.js ../srv-main/coursesvc/static/admin/vendor/admin-board/js/

cd ../srv-main
workon ch-board-srv-main

python ./manage.py collectstatic --no-input
touch /var/www/board_tapanda_ru_wsgi.py

deactivate
