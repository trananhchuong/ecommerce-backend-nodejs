import mongoose from "mongoose";
import os from "os";

const _SECONDS = 5000;

const checkConnect = async () => {
  try {
    const connection = mongoose.connections.length;
    console.log("🚀 ~ checkConnect ~ connection:", connection);
  } catch (error) {
    console.log("Error connecting to MongoDB", error);
  }
};

let intervalId: ReturnType<typeof setInterval> | null = null;

const checkOverload = () => {
  intervalId = setInterval(() => {
    const numConnection = mongoose.connections.length;
    const numCores = os.cpus().length;
    const memoryUsage = process.memoryUsage().rss;
    const maxConnections = numCores * 5;
    console.log(`Active connections: ${numConnection}`);
    console.log(`Memory usage: ${memoryUsage / 1024 / 1024} MB`);
    console.log(`Max connections: ${maxConnections}`);
    console.log(`--------------------------------`);
  }, _SECONDS);
  return intervalId;
};

const stopCheckOverload = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log("Check overload interval stopped");
  }
};

export { checkConnect, checkOverload, stopCheckOverload };
