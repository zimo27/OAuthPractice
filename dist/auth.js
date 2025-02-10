"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.token = exports.authorize = void 0;
const crypto_1 = require("crypto");
const jose_1 = require("jose");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const validClients = {
    upfirst: "http://localhost:8081/process",
};
const issuedTokens = {}; // Store tokens in-memory for simplicity
const authorize = (req, res) => {
    console.log("POST /api/auth route hit");
    const { response_type, client_id, redirect_uri, state } = req.query;
    if (response_type !== "code") {
        res.status(400).json({ error: "invalid_request" });
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
    const authCode = (0, crypto_1.randomBytes)(16).toString("hex");
    const redirectURL = new URL(redirect_uri);
    redirectURL.searchParams.append("code", authCode);
    if (state) {
        redirectURL.searchParams.append("state", state);
    }
    res.redirect(redirectURL.toString());
};
exports.authorize = authorize;
const token = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const jwt = yield new jose_1.SignJWT({ user: "test_user" })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(Number(process.env.TOKEN_EXPIRATION) || 3600)
        .sign(secret);
    res.json({
        access_token: jwt,
        token_type: "bearer",
        expires_in: process.env.TOKEN_EXPIRATION,
    });
});
exports.token = token;
