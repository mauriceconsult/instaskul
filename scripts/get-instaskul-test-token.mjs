import { randomBytes, createHash } from "node:crypto";
import { createServer } from "node:http";
import { exec } from "node:child_process";
import { URL } from "node:url";

const AUTHORIZE_URL = "https://fine-louse-2656.clerk.accounts.dev/oauth/authorize";
const TOKEN_URL = "https://fine-louse-2656.clerk.accounts.dev/oauth/token";
const CLIENT_ID = "4mo5xiRFM7l2Km9L";
// const CLIENT_SECRET = "jPaIzzokvdkfkXN4JWpqnF308wphyPbe";
const PORT = 4321;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;
// const REDIRECT_URI = "http://127.0.0.1:4321/callback";

function b64url(b) { return b.toString("base64").replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); }
const codeVerifier = b64url(randomBytes(32));
const codeChallenge = b64url(createHash("sha256").update(codeVerifier).digest());
const state = b64url(randomBytes(16));

const authUrl = new URL(AUTHORIZE_URL);
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("client_id", CLIENT_ID);
authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
authUrl.searchParams.set("scope", "openid email profile");
authUrl.searchParams.set("state", state);
authUrl.searchParams.set("code_challenge", codeChallenge);
authUrl.searchParams.set("code_challenge_method", "S256");

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "", REDIRECT_URI);
  const code = url.searchParams.get("code");
  res.end("Done — check your terminal.");
  server.close();

  const tokenRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      code_verifier: codeVerifier,
    }),
  });
  console.log(await tokenRes.json());
});
server.listen(PORT, () => exec(`start "" "${authUrl}"`));