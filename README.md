# Backend
This is a backend server as a test project. It receives JSON including lat/long and time information and returns weather information; see `data/*.json` for a sample of the required input format

## Installation
Install node dependencies:
```
npm ci
```

Weather data requires a Meteostat [api key][https://auth.meteostat.net/] and to be set in .env file

Sample .env file:
```
API_KEY={key from above link}
```

## Tests
```
npm test
```

## Linting
```
npm run test:lint
```

## Running
```
npm start
```

## Improvements
Things I would have liked to spend time on given more time

1. Cache weather/station data
2. [Deno][https://deno.land/]
3. Improve Typescript types and interactions

## Time spent
I spent approximately 5 hours on this project; most of that time was spent getting more comfortable with typescript and combining it with koa.js for the first time.
