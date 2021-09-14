#!/bin/bash

source /home/overklok/.bashrc

JSAPP_ROOT=/home/overklok/tapanda/ch-board/tmp/jsapp
SRV_ROOT=/home/overklok/tapanda/ch-board/srv-main
WSGI_PATH=/var/www/board_tapanda_ru_wsgi.py

while getopts j:s:w: flag
do
    case "${flag}" in
        j) JSAPP_ROOT=${OPTARG};;
        s) SRV_ROOT=${OPTARG};;
        w) WSGI_PATH=${OPTARG};;
    esac
done

STATIC_FRONTEND=$SRV_ROOT/app/tapanda/apps/frontend/static
STATIC_COURSES=$SRV_ROOT/app/tapanda/apps/courses/static

cd $JSAPP_ROOT

npm install
npm run build

# For PythonAnywhere servers

cd $SRV_ROOT/app || exit

cp -r $JSAPP_ROOT/dist/fonts    $STATIC_FRONTEND/frontend/app/fonts/
cp $JSAPP_ROOT/dist/main.js     $STATIC_FRONTEND/frontend/app/
cp $JSAPP_ROOT/dist/main.css    $STATIC_FRONTEND/frontend/app/
cp $JSAPP_ROOT/dist/blockly.js  $STATIC_COURSES/admin/vendor/admin-blockly/blockly.js
cp $JSAPP_ROOT/dist/blockly.css $STATIC_COURSES/admin/vendor/admin-blockly/blockly.css
cp $JSAPP_ROOT/dist/board.js    $STATIC_COURSES/admin/vendor/admin-board/board.js
cp $JSAPP_ROOT/dist/board.css   $STATIC_COURSES/admin/vendor/admin-board/board.css

workon bb-srv-main
cd $SRV_ROOT/app || exit
python manage.py collectstatic --no-input
touch WSGI_PATH
deactivate

# hooks/post-receive (+x):

# #!/bin/bash
# mkdir -p /home/overklok/tapanda/ch-board/jsapp
# GIT_WORK_TREE=/home/overklok/tapanda/ch-board/jsapp git checkout -f
# chmod +x /home/overklok/tapanda/ch-board/jsapp/deploy-pythonanywhere.sh
# /home/overklok/tapanda/ch-board/jsapp/deploy-pythonanywhere.sh
