/**
 * Local development server.
 *
 * Vercel runs each file in /api as a serverless function. This file fakes
 * that locally using Node's built-in http module, so you can test without
 * installing anything:
 *
 *     node server.js
 *
 * Then open http://localhost:3000/api/status?appointment_id=a29
 *
 * This file is only for local testing. Vercel ignores it and runs the files
 * in /api directly.
 */

import { createServer } from "node:http";
import statusHandler from "./api/status.js";
import locationHandler from "./api/location.js";

// Port 3000 is very commonly taken. Start there, and if it is busy just move
// to the next one automatically — see the listen block at the bottom.
const START_PORT = Number(process.env.PORT) || 3000;
const MAX_TRIES = 10;

const routes = {
  "/api/status": statusHandler,
  "/api/location": locationHandler
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const handler = routes[url.pathname];

  if (!handler) {
    res.writeHead(404, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        error: "Not found",
        available: Object.keys(routes)
      })
    );
  }

  // Give req and res the small extras Vercel adds for you.
  req.query = Object.fromEntries(url.searchParams);
  req.body = await readJsonBody(req);

  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data, null, 2));
    return res;
  };

  try {
    await handler(req, res);
  } catch (err) {
    res.status(500).json({ error: "Server error", detail: String(err) });
  }
});

function readJsonBody(req) {
  return new Promise((resolve) => {
    if (req.method !== "POST" && req.method !== "PUT") return resolve({});
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });
}

/**
 * Try START_PORT. If another program already has it, quietly try the next
 * port instead of crashing with EADDRINUSE.
 */
// Announce the banner once, from whichever port actually succeeded.
// (Passing a callback to listen() on every retry would print it once per
// attempt, because those callbacks stay registered.)
server.on("listening", () => {
  const base = `http://localhost:${server.address().port}`;
  console.log(`\nNextUp API running at ${base}\n`);
  console.log(`  GET   ${base}/api/status?appointment_id=a29`);
  console.log(`  POST  ${base}/api/location`);
  console.log('        body: { "appointment_id": "a29", "lat": 30.85, "lng": 75.95 }');
  console.log("\nPress Ctrl+C to stop.\n");
});

function listen(port, attempt = 1) {
  server.once("error", (err) => {
    if (err.code === "EADDRINUSE" && attempt < MAX_TRIES) {
      console.log(`Port ${port} is busy, trying ${port + 1}...`);
      listen(port + 1, attempt + 1);
    } else {
      console.error("Could not start the server:", err.message);
      process.exit(1);
    }
  });

  server.listen(port);
}

listen(START_PORT);
