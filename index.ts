import express, { Express, RequestHandler } from "express";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { expressjwt as expressJwt } from "express-jwt";

import {
  createTrack,
  getTrackByISRC,
  getTracksByArtist,
  login,
  register,
} from "./src/trackController";
import { JWT_SECRET } from "./src/config";


const app: Express = express();
app.use(express.json());

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Spotify Track Express API",
      version: "1.0.0",
      description: "A simple Express Library for managing music tracks",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          // name for the scheme
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: ["./src/*.ts"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const authenticateJWT: RequestHandler = expressJwt({
  secret: JWT_SECRET as string,
  algorithms: ["HS256"],
});

app.post("/register", register);
app.post("/login", login);
app.post("/tracks/:ISRC", authenticateJWT, createTrack);
app.get("/tracks/:ISRC", authenticateJWT, getTrackByISRC);
app.get("/artists/:artistName", authenticateJWT, getTracksByArtist);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
