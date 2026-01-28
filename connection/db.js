require("dotenv").config();

const mongoose = require("mongoose");
//----------------------------------------------
const chalk = require("../helpers/chalk");
//----------------------------------------------

module.exports = async () => {
  try {
    await mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 2500,
      maxPoolSize: 100,
    });
    chalk.printLog("DATABASE - mongodb connected", "FgCyan");
    return true;
  } catch (error) {
    chalk.printLog(
      `DATABASE - mongodb not connected - Error: ${error?.message}`,
      "FgRed"
    );
  }
};
