FROM launcher.gcr.io/google/nodejs
RUN install_node v4.6.2
COPY . /app/
RUN (cd programs/server && npm install --unsafe-perm)
CMD [ "npm", "start" ]