'use strict';

const mongoose = require('mongoose');

const checkConnect = async () => {
    try {
        const connection = mongoose.connections.length;
        console.log("🚀 ~ checkConnect ~ connection:", connection)
    } catch (error) {
        console.log('Error connecting to MongoDB', error);
    }
};

module.exports = checkConnect;