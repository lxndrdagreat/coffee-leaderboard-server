# coffee-leaderboard-server
A coffee consumption leaderboard server

## Slack App Setup

_TBD_

## Connecting 3rd Party Apps

### Get unique token from Slack

Users auth with the leaderboard via a Slack bot (e.g., `@CoffeeLeaderboard`)
with a slash command. In Slack, users do the following:

```
/coffeeauth
```

This will return a unique token, which should be copied/pasted into your app.

### App submits token to the server

Your app is then responsible for submitting the token to the server, which
will in turn return a final token that should be used by your app for all
future requests:

```http request
POST /api/app/auth HTTP/1.1
Host: localhost:8081
Content-Type: application/json
Content-Length: 208

{
    "serviceToken": "token_received_in_slack",
    "app": "Your app's name",
    "serviceName": "slack"
}
```

This will return a JSON response like the following:

```json
{
    "appToken": "unique token for your app and user",
    "user": {
      "userId": "user's id",
      "userName": "username"
    }
}
```

### Log coffee usage

```http request
POST /api/app/log HTTP/1.1
Host: localhost:8081
X-Leaderboard-Token: unique token for your app and user
X-Leaderboard-App: Your Apps Name
Content-Type: application/json
Content-Length: 60

{
    "message": ":coffee:"
}
```

_Note_: the `X-Leaderboard-App` header must match the app name submitted when
confirming the token.

### Checking the leaderboard

```http request
GET /api/leaderboard HTTP/1.1
Host: localhost:8081
x-leaderboard-token: unique token for your app and user
x-leaderboard-app: Your apps name
```

_Note_: the `X-Leaderboard-App` header must match the app name submitted when
confirming the token.

Response will look like this:

```json
{
  "all": [],
  "week": [],
  "today": []
}
```

Each value is a list containing the following object schema:

```json
{
  "userName": "string",
  "count": 1
}
```


## Deploy

### Build

- npm i ci
- npm run build

### Copy Files

The following folders/files should be copied to the deployment server:

- lib/
- .dockerignore
- Dockerfile
- docker-compose.yml
- package.json
- package-lock.json
- .env.example

### Environment

On the deployment server, make sure to set up the environment variables.
`.env.example` can be modified and renamed to `.env` to help faciliate this.

### Running

- docker-compose build
- docker-compose up -d

### Seed data

Once the docker containers are running, seed data files ("users.json" and
"entries.json") can be copied to the container:

```
docker cp ./entries.json coffee_api:/home/node/app/entries.json
docker cp ./users.json coffee_api:/home/node/app/users.json
```

Then, run the following to import the data:

```
docker-compose exec api npm run seed-database
```
