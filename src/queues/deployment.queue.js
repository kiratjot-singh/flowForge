import { Queue } from "bullmq";
import redis from "../config/redis.js";

const deploymentQueue = new Queue(
  "deployment",
  {
    connection: redis
  }
);

export default deploymentQueue;