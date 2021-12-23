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

# Re-collect static files if some were added to sources
/opt/$PROJECT_NAME/run.sh prod collectstatic