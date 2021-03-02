# coffee-leaderboard-server
A coffee consumption leaderboard server

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

Seed data files ("users.json" and "entries.json") can be copied to the container:

```
docker cp ./entries.json coffee_api:/home/node/app/entries.json
docker cp ./users.json coffee_api:/home/node/app/users.json
```
