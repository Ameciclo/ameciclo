FROM strapi/base
WORKDIR /srv/app
COPY ./package.json ./
COPY ./yarn.lock ./
RUN yarn install --prod
COPY . .
ENV NODE_ENV production
RUN yarn build --clean
EXPOSE 1337
CMD ["yarn", "start"]
