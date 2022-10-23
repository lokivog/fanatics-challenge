# fanatics-challenge

# Bet Fanatics Coding Challenge NodeJS App

## Installing

```bash
yarn install
yarn build
yarn start
yarn test
```

## Running

1. Get an access token at https://gorest.co.in/
2. Copy .env.example to .env
3. Set your access token in .env

```bash
yarn build
yarn start
yarn test
```

## Test

```bash
yarn test
```

## Documentation

This Node App performs the following:

Using the REST API endpoints documented in the link in the previous section:

1. Retrieve page 3 of the list of all users.
2. Using a logger, log the total number of pages from the previous request.
3. Sort the retrieved user list by name.
4. After sorting, log the name of the last user.
5. Update that user's name to a new value and use the correct http method to save it.
6. Delete that user.
7. Attempt to retrieve a nonexistent user with ID 5555. Log the resulting http response code.
8. Write unit tests for all code, mocking out calls to the actual API service.
