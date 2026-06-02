import Docker from "dockerode";

const docker = new Docker();

const container = await docker.createContainer({
  Image: "alpine",
  Cmd: ["echo", "FlowForge container works"],
  Tty: false
});

await container.start();

const stream = await container.logs({
  stdout: true,
  stderr: true,
  follow: false
});

console.log(stream.toString());

await container.remove({
  force: true
});