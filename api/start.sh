#!/bin/bash
SCRIPT_DIR=$(dirname "$0")
LOGS_DIR="$SCRIPT_DIR/data/logs"
mkdir -p "$LOGS_DIR"
NODE_ENV=production node "$SCRIPT_DIR" 2> >(ts '%d.%m.%Y_%H:%M:%S' >> "$LOGS_DIR/error.log")
