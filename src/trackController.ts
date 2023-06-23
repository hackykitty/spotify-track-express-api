import axios from "axios";
import { RequestHandler } from "express";
import { Op } from "sequelize";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { Track, Artist, User } from "./db";
import { getAccessToken } from "./utils";
import { JWT_SECRET } from "./config";

/**
 * @swagger
 *
 * /register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with the provided username and password
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       500:
 *         description: Server error
 */
export const register: RequestHandler = async (req, res) => {
  const { username, password } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ username, password: hashedPassword });

    res.status(201).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Could not create user" });
  }
};

/**
 * @swagger
 *
 * /login:
 *   post:
 *     summary: Login endpoint
 *     description: Use user and password to receive a JWT
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *       401:
 *         description: Invalid user or password
 *       500:
 *         description: Server error
 */
export const login: RequestHandler = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { username: user.username },
        JWT_SECRET!,
        {
          expiresIn: "1h",
        }
      );
      res.status(200).json({ token });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

/**
 * @swagger
 *
 * /tracks/{ISRC}:
 *   post:
 *     summary: Creates a new track
 *     description: Use an ISRC to fetch data from Spotify API and save the track metadata into the DB
 *     parameters:
 *       - in: path
 *         name: ISRC
 *         required: true
 *         description: International Standard Recording Code for the track
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Track created
 *       400:
 *         description: Track already exists
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No Track
 *       500:
 *         description: Server error
 */
export const createTrack: RequestHandler = async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    const ISRC = req.params.ISRC;
    let { data } = await axios.get(
      `https://api.spotify.com/v1/search?q=isrc:${ISRC}&type=track`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (data.tracks && data.tracks.items.length > 0) {
      data.tracks.items.sort(
        (a: { popularity: number }, b: { popularity: number }) =>
          b.popularity - a.popularity
      );

      const trackData = data.tracks.items[0];

      // Check if the track already exists
      const existingTrack = await Track.findOne({ where: { ISRC } });
      if (existingTrack) {
        res.status(400).json({ message: "Track already exists" });
        return;
      }

      const track = await Track.create({
        ISRC,
        imageUri: trackData.album.images[0].url,
        title: trackData.name,
      });

      const artists = trackData.artists.map((artist: { name: any }) =>
        Artist.create({ name: artist.name, trackISRC: ISRC })
      );

      await Promise.all(artists);
      const createdTrack = await Track.findOne({
        where: { ISRC },
        include: Artist,
      });

      res.json(createdTrack);
    } else {
      res.status(404).json("No track");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

/**
 * @swagger
 *
 * /tracks/{ISRC}:
 *   get:
 *     summary: Get a track by ISRC
 *     description: Fetches track metadata from the DB by ISRC
 *     parameters:
 *       - in: path
 *         name: ISRC
 *         required: true
 *         description: International Standard Recording Code for the track
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Track fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Track not found
 *       500:
 *         description: Server error
 */
export const getTrackByISRC: RequestHandler = async (req, res) => {
  try {
    const track = await Track.findOne({
      where: { ISRC: req.params.ISRC },
      include: { model: Artist },
    });
    if (track) {
      res.json(track);
    } else {
      res.status(404).send("Track not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

/**
 * @swagger
 *
 * /artists/{artistName}:
 *   get:
 *     summary: Get tracks by an artist name
 *     description: Fetches multiple track metadata from the DB by artist name
 *     parameters:
 *       - in: path
 *         name: artistName
 *         required: true
 *         description: Name of the artist
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tracks fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No tracks found for the artist
 *       500:
 *         description: Server error
 */
export const getTracksByArtist: RequestHandler = async (req, res) => {
  try {
    const artistName = req.params.artistName;
    const tracks = await Track.findAll({
      include: [
        {
          model: Artist,
          where: {
            name: {
              [Op.like]: `%${artistName}%`,
            },
          },
        },
      ],
    });

    if (tracks.length > 0) {
      const trackData = tracks.map((track) => {
        return {
          ISRC: track.ISRC,
          imageUri: track.imageUri,
          title: track.title,
        };
      });

      res.json(trackData);
    } else {
      res.status(404).send("No tracks found for the artist");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
