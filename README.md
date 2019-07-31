# Hackathon Starter Kit [![Build Status](https://travis-ci.com/PurdueHackers/HackathonStarterKit.svg?branch=master)](https://travis-ci.com/PurdueHackers/HackathonStarterKit)

## Introduction

Hackathon Starter Kit is a boilerplate for creating hackathon websites. It comes with everything you need out of the box so you can focus on creating a beautiful hackathon website.

Included:

-   Authentication / Authorization
-   Registration / Applications
    -   Google Cloud Storage for uploading resumes
-   Announcements
    -   Can sync with slack channel
-   Checkin System
    -   Supports scanning QR Codes
-   Service Worker
    -   Push Notifications / Offline Caching
-   Email Service
    -   Uses SendGrid
    -   Send emails on requests with 500 HTTP codes
-   Fully Tested

    -   Integration / End-to-End

-   NOTE: We deliberately chose not to add any styling to allow you to focus mainly on design and user experience rather than implementing features

## Development

### Prerequisites

-   [NodeJS](https://nodejs.org/en/)
-   [MongoDB](https://docs.mongodb.com/manual/installation/)
-   [Yarn](https://yarnpkg.com/en/docs/install)
-   [Homebrew](https://brew.sh/) \*Only on Mac
-   [Docker](https://www.docker.com/)
-   [Docker Compose](https://docs.docker.com/compose/install/)

### Usage with Docker

-   Prerequisites:
    1. `yarn web-push generate-vapid-keys`
        - Copy the values to "VAPID_PUBLIC" and "VAPID_PRIVATE" in your .env
    2. Edit your `.env` file in root of the project
        - See `backend/config/env-config.js` for list of ENVs to modify
-   To start: `docker-compose up`
    -   Open http://localhost:5000 to view the app
    -   Open http://localhost:8081 to view [mongo-express](https://github.com/mongo-express/mongo-express)
-   To stop: 1. Ctrl+C when inside `docker-compose up` \* OR 2. `docker-compose down`
-   To build: `docker-compose build`

*   NOTE: All of these commands are available as runnable tasks within VSCode

### Usage without Docker

1. `yarn`
2. `yarn web-push generate-vapid-keys`
    - Copy the values to "VAPID_PUBLIC" and "VAPID_PRIVATE" in your .env
3. Edit your `.env` file in root of the project
    - See `backend/config/env-config.js` for list of ENVs to modify
4. Make sure MongoDB is running:
    - `mongod`
5. `yarn dev`
6. Open http://localhost:5000

## Technologies used:

#### Frontend:

-   [NextJS](https://nextjs.org/)
-   [ReactJS](https://reactjs.org/)
-   [ReduxJS](https://redux.js.org/)

#### Backend:

-   [TypeScript](https://www.typescriptlang.org/)
-   [Mongoose](https://mongoosejs.com/)
-   [ExpressJS](https://expressjs.com/)
-   [Routing Controllers](https://github.com/typestack/routing-controllers)
