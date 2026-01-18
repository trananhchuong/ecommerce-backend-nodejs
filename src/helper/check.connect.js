'use strict';

const mongoose = require('mongoose');
const os = require('os');
const _SECONDS = 5000;

const checkConnect = async () => {
    try {
        const connection = mongoose.connections.length;
        console.log("🚀 ~ checkConnect ~ connection:", connection)
    } catch (error) {
        console.log('Error connecting to MongoDB', error);
    }
};

const checkOverload = () => {
    setInterval(() => {
        const numConnection = mongoose.connections.length;
        const numCores = os.cpus().length;
        const memoryUsage = process.memoryUsage().rss;
        const maxConnections = numCores * 5;
        console.log(`Active connections: ${numConnection}`);
        console.log(`Memory usage: ${memoryUsage / 1024 / 1024} MB`);
        console.log(`Max connections: ${maxConnections}`);
        console.log(`--------------------------------`);
    }, _SECONDS);
};

module.exports = {
    checkConnect,
    checkOverload,
};