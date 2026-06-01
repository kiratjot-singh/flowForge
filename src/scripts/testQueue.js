import deploymentQueue from "../queues/deployment.queue.js";

await deploymentQueue.add(
  "build-project",
  {
    deploymentId: "125"
  }
);

console.log("Job added");

process.exit(0);