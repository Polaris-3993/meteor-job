#!/usr/bin/env bash
mongodump -h 35.187.68.103 -d vezio -u vz-core -p 8Cp-uS4-r8r-7pN -o ../vezio-backups/
mongorestore -h 127.0.0.1 --port 3001 -d meteor ../vezio-backups/vezio --drop