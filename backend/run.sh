#!/bin/bash
cd backend
yarn
sudo docker-compose up
firefox --new-tab http://localhost:1337/admin
