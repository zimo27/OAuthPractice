import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import * as dotenv from "dotenv";
import { authorize, token } from "./auth";

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/api/oauth/authorize", authorize);
app.post("/api/oauth/token", token);
app.post("/api/oauth/token", (req, res, next) => {
    console.log("POST /api/oauth/token route hit");
    next();
  }, token);
  
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`OAuth2 server running on http://localhost:${PORT}`);
});
