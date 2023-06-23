import axios from "axios";
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from "./config";

export const getAccessToken = async () => {
  const authData = new URLSearchParams();
  authData.append("grant_type", "client_credentials");

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      authData,
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET
            ).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (response.status === 200) {
      // return the access token
      return response.data.access_token;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};
