# Spotify Track Express API

This is a REST API that allows you to store and fetch music track metadata from a database. The metadata is fetched from the Spotify API.

## Installation

1. Clone this repository:
git clone https://github.com/hackykitty/spotify-track-express-api.git

2. Install the dependencies:
npm install

3. Copy the `.env.example` to `.env` and update the environment variables:
cp .env.example .env

4. Run the server:
npm start

## API Endpoints

- `POST /register`: Creates a new user
- `POST /login`: Login with a user to get access token
- `POST /tracks/:ISRC`: Creates a new track with the given ISRC
- `GET /tracks/:ISRC`: Fetches a track by the given ISRC
- `GET /artists/:artistName`: Fetches tracks by the given artist name

## Testing

Visit http://localhost:3000/api-docs for swaggerUI