#!/bin/bash

# Static file collection for Tapanda server instance deployed by CodeDeploy
# -------------------------------------------------------------------------
#
# Supposed to be hooked on ApplicationStart event 
# of CodeDeploy lifecycle and ran as 'tapanda' user.
#
# Pre-conditions:
#   - Tapanda server application (bb-srv) is deployed on target machine
#     and configured to take static files from /var/opt/tapanda/bundles

set -e

PROJECT_NAME=tapanda

TMP_ROOT=/tmp/opt/tapanda/bundles
DIR_ROOT=/var/opt/tapanda/bundles

DIR_APP=$DIR_ROOT/frontend/app
DIR_ADMIN_BLOCKLY=$DIR_ROOT/admin/vendor/admin-blockly
DIR_ADMIN_BOARD=$DIR_ROOT/admin/vendor/admin-board

mkdir -p $DIR_ROOT

mkdir -p $DIR_APP
mkdir -p $DIR_ADMIN_BLOCKLY
mkdir -p $DIR_ADMIN_BOARD

rsync -r $TMP_ROOT/blockly  $DIR_ADMIN_BLOCKLY 
rsync -r $TMP_ROOT/board    $DIR_ADMIN_BOARD 
rsync -r $TMP_ROOT/main     $DIR_APP

# Re-collect static files if some were added to sources
/opt/$PROJECT_NAME/run.sh prod collectstatic
