FROM node:24

WORKDIR /front

RUN npm install -g @angular/cli

COPY package*.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

EXPOSE 4200

CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200"]
