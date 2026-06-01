import redis from "../config/redis.js";

await redis.set("flowforge", "working");

const value = await redis.get("flowforge");

console.log(value);

await redis.quit();