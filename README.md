# Test Task QT

## Prerequisites

-   Git - [Download & Install Git](https://git-scm.com/downloads).
-   Node.js - [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager.
-   Docker Desktop - [Download & Install Docker Desktop](https://hub.docker.com/repository/docker/fresemin/music-service-db/general)

## Downloading

```
git clone https://github.com/FreSemin/test-task-qt
```

## Set up Environment variables

1. Create `.env` file in the root folder
2. Copy variables from `.example.env`
3. Set up your values for variables.

## Running application (Locally)

1.  Install NPM modules:

    ```
    npm install
    ```

2.  Set up Database and Redis

    2.1 From the root folder run:

        ```
        docker compose up
        ```

    2.2 Run Database migrations:

        ```
        npm run migration:run
        ```

3.  Run application locally, from the root run:

    ```
    npm start
    ```

After starting the app on port `APP_PORT` (4000 as default) you can use make requests to `http://localhost:4000/api`
After starting the app you can open in your browser OpenAPI documentation by typing http://localhost:4000/doc/.
For more information about OpenAPI/Swagger please visit https://swagger.io/.

### API Endpoints

-   **Auth**

-   `POST` `/api/auth/reg` - Registration of new user;

    -   body:

    ```
    {
      "name": "name",
      "email": "email3@gmail.com",
      "password": "12345678",
      "retypedPassword": "12345678"
    }
    ```

    -   expected result:

    ```
    {
      "name": "name",
      "email": "email33@gmail.com",
      "id": "3a8cf9f3-9a0e-4906-90d8-b064453c17c0"
    }
    ```

-   `POST` `/api/auth/login` - Login User to system, create access and set refresh token cookies

    -   body:

    ```
    {
      "email": "email2@gmail.com",
      "password": "12345678"
    }
    ```

    -   expected result:

    ```
    {
      "accessToken": "Bearer <access_token>"
    }
    ```

-   `GET` `/api/auth/refresh` - Get new access token and update refresh token cookie

    -   expected result:

    ```
    {
      "accessToken": "Bearer <access_token>"
    }
    ```

-   `GET` `/api/auth/logout` - Delete Refresh token from cookies and system

    -   expected result:

    ```
    {
      "accessToken": "Bearer <access_token>"
    }
    ```

-   **Post** (Required authorization cookie)

-   `POST` `/api/post` - Create new post;

    -   body:

    ```
    {
      "name": "post name",
      "description": "post description"
    }
    ```

    -   expected result:

    ```
    {
      "name": "post1user1",
      "description": "post description",
      "authorId": "a9f1eb65-8776-4c74-8d96-564135e1ad16",
      "id": "76a11fd3-2646-4466-881f-7a649b2a65df",
      "published_at": "2024-03-24T21:33:45.143Z"
    }
    ```

-   `GET` `/api/post` - Get All posts;

    -   Query parameters:

        -   `authorId` - (Optional) Get all posts created by user;
        -   `from` - (Optional) Get all posts from date (Date format - `YYYY-MM-DDTHH:mm`)
        -   `to` - (Optional) Get all posts to date (Date format - `YYYY-MM-DDTHH:mm`)
        -   `page` - (Optional) - Get all posts by page
        -   `take` - (Optional) - Get count of posts

    -   request example:

    ```
    api/post?authorId=<user_id>&from=YYYY-MM-DDTHH:mm&to=YYYY-MM-DDTHH:mm&page=1&take=5
    ```

    -   request example:

    ```
    api/post?authorId=a9f1eb65-8776-4c74-8d96-564135e1ad16&from=2024-03-20T20:00&to=2024-03-25T02:00&page=1&take=3
    ```

    -   expected result:

    ```
      {
      "page": 1,
      "data": [
          {
              "id": "3991edaa-ac4a-4df8-9bb4-ed6bfddaf9ee",
              "name": "post1user1",
              "description": "post description",
              "published_at": "2024-03-24T16:57:49.680Z",
              "authorId": "a9f1eb65-8776-4c74-8d96-564135e1ad16"
          },
          {
              "id": "717009ca-f5df-4b50-b7c0-169a1b6aaca3",
              "name": "post1user1",
              "description": "post description",
              "published_at": "2024-03-24T15:57:50.338Z",
              "authorId": "a9f1eb65-8776-4c74-8d96-564135e1ad16"
          },
          {
              "id": "2e3bb264-45c5-4a4d-806d-a7060b9ce9c4",
              "name": "post1user1",
              "description": "post description",
              "published_at": "2024-03-24T14:57:51.258Z",
              "authorId": "a9f1eb65-8776-4c74-8d96-564135e1ad16"
          }
      ],
      "total": 4
    }
    ```

    -   **Warning!** - Take into a count your 'rest api agent' time zone manipulations.

-   `GET` `/api/post/:post_id` - Get Post by id;

    -   expected result:

    ```
    {
      "name": "post1user1",
      "description": "post description",
      "authorId": "a9f1eb65-8776-4c74-8d96-564135e1ad16",
      "id": "76a11fd3-2646-4466-881f-7a649b2a65df",
      "published_at": "2024-03-24T21:33:45.143Z"
    }
    ```

-   `PUT` `/api/post/:post_id` - Update Post by id;

    -   body:

    ```
    {
      "name": "updated post name",
      "description": "updated post description"
    }
    ```

    -   expected result:

    ```
    {
      "name": "updated post name",
      "description": "updated post description"
      "authorId": "a9f1eb65-8776-4c74-8d96-564135e1ad16",
      "id": "76a11fd3-2646-4466-881f-7a649b2a65df",
      "published_at": "2024-03-24T21:33:45.143Z"
    }
    ```

-   `DELETE` `/api/post/:post_id` - Delete Post by id;

    -   expected result:

    ```
    {
      "name": "post1user1",
      "description": "post description",
      "authorId": "a9f1eb65-8776-4c74-8d96-564135e1ad16",
      "id": "76a11fd3-2646-4466-881f-7a649b2a65df",
      "published_at": "2024-03-24T21:33:45.143Z"
    }
    ```

-   **User**

-   `GET` `/api/user/:email_or_userId` - Get user by email or id;

    -   expected result:

    ```
    {
      "id": "b1017175-4ea0-4bf6-b21d-f75d5d89e227",
      "name": "name",
      "email": "email1@gmail.com"
    }
    ```

## Testing

To run all tests

```
npm run test
```

To run all tests and see code coverage

```
npm run test:cov
```

### Auto-fix and format

```
npm run lint
```

```
npm run format
```

#### Postman

You can Import collections and environment to your local PostMan from `postman` folder;
