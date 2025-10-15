/********************************************************************************* 
* WEB700 – Assignment 06 
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part of this 
* assignment has been copied manually or electronically from any other source (including web sites) or 
* distributed to other students. 
* 
* Name: Sampavi Shanthakumar 
* Student ID: 147633234 
* Date: 1st August 2024 
* 
* 
* 
********************************************************************************/
// server.js
const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const collegeData = require("./modules/collegeData");

const app = express();

// active route helper
app.use((req, res, next) => {
  let route = req.path.substring(1);
  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));
  next();
});

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
      navLink(url, options) {
        return (
          '<li' +
          (url == app.locals.activeRoute
            ? ' class="nav-item active" '
            : ' class="nav-item" ') +
          '><a class="nav-link" href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      equal(l, r, options) {
        if (arguments.length < 3) throw new Error("equal needs 2 params");
        return l != r ? options.inverse(this) : options.fn(this);
      }
    }
  })
);
app.set("view engine", ".hbs");

// --- your routes (unchanged) ---
app.get("/", (req, res) => res.render("home"));
// ... /students, /student/:id, /courses, etc. ...

// Serverless-friendly init
let _init;
async function ensureInit() {
  if (!_init) _init = collegeData.initialize();
  return _init;
}

module.exports = { app, ensureInit };

// For LOCAL ONLY: run a port when not on Vercel
if (require.main === module) {
  const HTTP_PORT = process.env.PORT || 8080;
  ensureInit()
    .then(() => app.listen(HTTP_PORT, () => console.log("listening on " + HTTP_PORT)))
    .catch((e) => {
      console.error("Failed to initialize:", e);
      process.exit(1);
    });
}
