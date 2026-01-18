const app = require("./src/app");
const mongoose = require("mongoose");
const { stopCheckOverload } = require("./src/helper/check.connect");

const PORT = process.env.PORT || 3003;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const gracefulShutdown = async () => {
  console.log("\nServer is shutting down...");
  
  // Stop the check overload interval
  stopCheckOverload();
  
  // Close the HTTP server
  server.close(async () => {
    console.log("HTTP server closed");
    
    // Close MongoDB connection (returns a Promise in newer Mongoose versions)
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed");
      process.exit(0);
    } catch (error) {
      console.error("Error closing MongoDB connection:", error);
      process.exit(1);
    }
  });
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
