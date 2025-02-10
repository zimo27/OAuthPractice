import { Request, Response } from "express";
import { randomBytes } from "crypto";
import { SignJWT } from "jose";
import * as dotenv from "dotenv";

dotenv.config();

const validClients: Record<string, string> = {
    upfirst: "http://localhost:8081/process",
  };

const issuedTokens: Record<string, string> = {};

export const authorize = (req: Request, res: Response): void => {
    console.log("POST /api/auth route hit");
    const { response_type, client_id, redirect_uri, state } = req.query;
  
    if (response_type !== "code") {
      res.status(400).json({ error: "invalid_request" });
      return;
    }
  
    if (!client_id || !validClients[client_id as string]) {
      res.status(400).json({ error: "invalid_client" });
      return;
    }
  
    if (validClients[client_id as string] !== redirect_uri) {
      res.status(400).json({ error: "invalid_redirect_uri" });
      return;
    }
  
    const authCode = randomBytes(16).toString("hex");
  
    const redirectURL = new URL(redirect_uri as string);
    redirectURL.searchParams.append("code", authCode);
  
    if (state) {
      redirectURL.searchParams.append("state", state as string);
    }
  
    res.redirect(redirectURL.toString());
  };
  
  export const token = async (req: Request, res: Response): Promise<void> => {
    console.log("Received POST to /token with body:", req.body);
    console.log("POST /api/oauth/token route hit");
    const { grant_type, code, client_id, redirect_uri } = req.body;
  
    if (grant_type !== "authorization_code") {
      res.status(400).json({ error: "unsupported_grant_type" });
      return;
    }
  
    if (!code) {
      res.status(400).json({ error: "invalid_grant" });
      return;
    }
  
    if (!client_id || !validClients[client_id]) {
      res.status(400).json({ error: "invalid_client" });
      return;
    }
  
    if (validClients[client_id] !== redirect_uri) {
      res.status(400).json({ error: "invalid_redirect_uri" });
      return;
    }
  
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    console.log("TOKEN_EXPIRATION:", process.env.TOKEN_EXPIRATION);

    const jwt = await new SignJWT({ user: "test_user" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(Number(process.env.TOKEN_EXPIRATION) || 3600)
      .sign(secret);
  
    res.json({
      access_token: jwt,
      token_type: "bearer",
      expires_in: process.env.TOKEN_EXPIRATION,
    });
  };
  

