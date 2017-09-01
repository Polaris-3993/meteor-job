#!/usr/bin/env bash

# killall node
# mkdir -p ".meteor/logs/"
# LOGFILE=".meteor/logs/local.log"
# touch $LOGFILE
# meteor run --settings private/config/dev.json > $LOGFILE &

export NODE_OPTIONS="-r spm-agent-nodejs"
export SPM_TOKEN="eff2fa8b-c06f-4f26-8391-60f5d20711b0"

meteor run --settings config/settings/dev.json
