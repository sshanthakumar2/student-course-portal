/*********************************************************************************
* WEB700 – Assignment 06
* Name: Sampavi Shanthakumar | Student ID: 147633234 | Date: 1st August 2024
*********************************************************************************/
const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const collegeData = require("./modules/collegeData");

const app = express();

// nav highlight helper
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

// ----------------- ROUTES -----------------
app.get("/", (req, res) => res.render("home"));
app.get("/about", (req, res) => res.render("about"));
app.get("/htmlDemo", (req, res) => res.render("htmlDemo"));

// Students list (optional ?course=ID)
app.get("/students", (req, res) => {
  const course = req.query.course;
  const p = course
    ? collegeData.getStudentsByCourse(course)
    : collegeData.getAllStudents();

  p.then((data) => {
    if (data && data.length) res.render("students", { students: data });
    else res.render("students", { message: "no results" });
  }).catch(() => res.render("students", { message: "no results" }));
});

// Add student (form + submit)
app.get("/students/add", (req, res) => {
  collegeData
    .getCourses()
    .then((courses) => res.render("addStudent", { courses }))
    .catch(() => res.render("addStudent", { courses: [] }));
});

app.post("/students/add", (req, res) => {
  collegeData
    .addStudent(req.body)
    .then(() => res.redirect("/students"))
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error adding student");
    });
});

app.get("/student/:studentNum", (req, res) => {
  let viewData = {};
  collegeData
    .getStudentByNum(req.params.studentNum)
    .then((student) => {
      viewData.student = student || null;
      return collegeData.getCourses();
    })
    .then((courses) => {
      viewData.courses = courses || [];
      if (viewData.student) {
        for (const c of viewData.courses) {
          if (c.courseId == viewData.student.course) c.selected = true;
        }
      }
    })
    .catch(() => {
      if (!viewData.student) {
        res.status(404).send("Student Not Found");
        return;
      }
      viewData.courses = [];
    })
    .finally(() => {
      if (viewData.student === null) res.status(404).send("Student Not Found");
      else res.render("student", { viewData });
    });
});

app.post("/student/update", (req, res) => {
  collegeData
    .updateStudent(req.body)
    .then(() => res.redirect("/students"))
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error updating student");
    });
});

app.get("/student/delete/:studentNum", (req, res) => {
  collegeData
    .deleteStudentByNum(req.params.studentNum)
    .then(() => res.redirect("/students"))
    .catch((err) =>
      res
        .status(500)
        .send("Unable to Remove Student / Student not found: " + err)
    );
});

// Courses
app.get("/courses", (req, res) => {
  collegeData
    .getCourses()
    .then((data) => {
      if (data && data.length) res.render("courses", { courses: data });
      else res.render("courses", { message: "no results" });
    })
    .catch(() => res.render("courses", { message: "no results" }));
});

app.get("/course/:id", (req, res) => {
  collegeData
    .getCourseById(req.params.id)
    .then((course) => {
      if (course) res.render("course", { course });
      else res.status(404).send("Course Not Found");
    })
    .catch(() => res.status(500).send("Unable to retrieve course"));
});

app.get("/courses/add", (req, res) => res.render("addCourse"));

app.post("/courses/add", (req, res) => {
  collegeData
    .addCourse(req.body)
    .then(() => res.redirect("/courses"))
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error adding course");
    });
});

app.post("/course/update", (req, res) => {
  collegeData
    .updateCourse(req.body)
    .then(() => res.redirect("/courses"))
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error updating course");
    });
});

app.get("/course/delete/:id", (req, res) => {
  collegeData
    .deleteCourseById(req.params.id)
    .then(() => res.redirect("/courses"))
    .catch(() =>
      res.status(500).send("Unable to Remove Course / Course not found")
    );
});

// 404
app.use((req, res) => {
  res.status(404).send("Page Not THERE, Are you sure of the path?");
});

// ---- export for Vercel; run locally if called directly ----
let _init;
async function ensureInit() {
  if (!_init) _init = collegeData.initialize();
  return _init;
}
module.exports = { app, ensureInit };

if (require.main === module) {
  const HTTP_PORT = process.env.PORT || 8080;
  ensureInit()
    .then(() => app.listen(HTTP_PORT, () => console.log("listening on " + HTTP_PORT)))
    .catch((e) => {
      console.error("Failed to initialize:", e);
      process.exit(1);
    });
}
