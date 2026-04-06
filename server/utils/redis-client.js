import { createClient } from "redis";

export const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on("connect", () => {
  console.log("connect");
});

redis.on("error", (err) => {
  console.log("error: " + err);
});

await redis.connect();
