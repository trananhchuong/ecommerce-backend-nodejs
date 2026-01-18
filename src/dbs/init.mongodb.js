"use strict";

const mongoose = require("mongoose");
const { db: { host, port, name } } = require("../configs/config.mongodb");

const connectString = `mongodb://${host}:${port}/${name}`;
const { checkConnect } = require("../helper/check.connect");

class Database {
  constructor() {
    this.connect();
  }

  connect() {
    if (1 === 1) {
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }

    mongoose.connect(connectString)
      .then(() => {
        console.log("Connected to MongoDB");
        checkConnect();
      })
      .catch((err) => {
        console.log("Error connecting to MongoDB", err);
      });
  }

  /**
   * Purpose of static in this context
   * The static keyword makes getInstance() a class method, not an instance method. This means:
   * - It can be called directly on the class without creating an instance:
   *   Database.getInstance()  // ✅ Works - calling on the class
   *   // vs
   *   const db = new Database();
   *   db.getInstance()  // ❌ Would fail - instance methods don't have access to static methods
   * - It's used to implement the Singleton pattern: ensuring only one instance of the Database class exists throughout your application.
   */
  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

module.exports = Database.getInstance();