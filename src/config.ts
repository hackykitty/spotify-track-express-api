import dotenv from "dotenv";
dotenv.config();

export const DB_NAME = process.env.DB_NAME
export const DB_USER = process.env.DB_USER
export const DB_PASS = process.env.DB_PASS
export const DB_HOST = process.env.DB_HOST

export const PORT = process.env.PORT

export const JWT_SECRET = process.env.JWT_SECRET

export const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
export const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
