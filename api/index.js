// api/index.js
const { app, ensureInit } = require("../server");

module.exports = async (req, res) => {
  try {
    await ensureInit();
    return app(req, res); // Express app is a request handler
  } catch (e) {
    console.error("Init error:", e);
    res.statusCode = 500;
    res.end("Initialization failed");
  }
};
