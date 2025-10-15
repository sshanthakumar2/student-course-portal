const { app, ensureInit } = require("../server");

module.exports = async (req, res) => {
  try {
    await ensureInit();
    return app(req, res); // Express app acts as request handler
  } catch (e) {
    console.error("Init error:", e);
    res.statusCode = 500;
    res.end("Initialization failed");
  }
};
