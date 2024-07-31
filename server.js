/********************************************************************************* 
* WEB700 – Assignment 05 
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part 
* of this assignment has been copied manually or electronically from any other source 
* (including 3rd party web sites) or distributed to other students. 
* 
* Name: Sampavi Shanthakumar 
* Student ID: 147633234 
* Date: 25th July 2024 
* 
* Online (Heroku) Link: https://secure-crag-28378-743a2716d10c.herokuapp.com/
* 
********************************************************************************/ 

const HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const app = express();
const collegeData = require("./modules/collegeData");
const path = require("path");
const exphbs = require("express-handlebars");

// Middleware to set active route for navigation highlighting
app.use(function(req,res,next){ 
    let route = req.path.substring(1); 
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, "")); 
    next(); 
});

// Adding the static middleware to serve files from the directory named public
app.use(express.static(path.join(__dirname, 'public')));

// Adding body-parser middleware
app.use(express.urlencoded({ extended: true }));

// Setting up Handlebars as the view engine with custom helpers
app.engine('.hbs', exphbs.engine({ extname: '.hbs', defaultLayout: 'main', helpers: {
    navLink: function(url, options){ 
    return '<li' + 
    ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + 
    '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>'; 
    },
    equal: function (lvalue, rvalue, options) { 
        if (arguments.length < 3) 
        throw new Error("Handlebars Helper equal needs 2 parameters"); 
        if (lvalue != rvalue) { 
        return options.inverse(this); 
        } else { 
        return options.fn(this); 
        } 
       } 
    } 
}));
app.set('view engine', '.hbs');

// Route to handle the students data
app.get("/students",(req,res)=>{
    var course = req.query.course;
        if(course){
            collegeData.getStudentsByCourse(course).then((data) => {
                if (data.length > 0) {
                    res.render("students", {students: data});
                }else{
                    res.render('students', { message: "no results" });
                }
            }).catch((err) => {
                res.render("students", {message: "no results"});
            });
        }else{
            collegeData.getAllStudents().then((data) => {
                if (data.length > 0) {
                    res.render("students", {students: data});
                }else{
                    res.render('students', { message: "no results" });
                }
            }).catch((err) => {
                res.render("students", {message: "no results"});
            });
        }
    });

// Route to handle the courses data
app.get("/courses",(req,res)=>{
    collegeData.getCourses().then((data) => {
        if (data.length > 0) {
            res.render("courses", {courses: data});
        }else{
            res.render('courses', { message: "no results" });
        }
    }).catch((err) => {
        res.render("courses", {message: "no results"});
    });
});

// Route to handle displaying a course by its ID
app.get("/course/:id", (req, res) => {
    collegeData.getCourseById(req.params.id)
        .then((data) => {
            if (data) {
                res.render("course", { course: data });
            } else {
                res.status(404).send("Course Not Found");
            }
        })
        .catch(() => {
            res.status(500).send("Unable to retrieve course");
        });
});

app.get("/student/:studentNum", (req, res) => {
    let viewData = {};

    collegeData.getStudentByNum(req.params.studentNum)
        .then(studentData => {
            console.log("Fetched student data:", studentData);
            if (studentData) {
                viewData.student = studentData;
            } else {
                viewData.student = null;
            }
            return collegeData.getCourses();
        })
        .then(courseData => {
            console.log("Fetched course data:", courseData);
            viewData.courses = courseData;
            if (viewData.student) {
                for (let i = 0; i < viewData.courses.length; i++) {
                    if (viewData.courses[i].courseId == viewData.student.course) {
                        viewData.courses[i].selected = true;
                    }
                }
            }
            res.render("student", { viewData: viewData });
        })
        .catch(err => {
            console.error("Error fetching data:", err);
            if (viewData.student === null) {
                res.status(404).send("Student Not Found");
            } else {
                viewData.courses = [];
                res.render("student", { viewData: viewData });
            }
        });
});

// Route to handle the home page
app.get("/",(req,res)=>{
    res.render("home");
});

// Route to handle the about page
app.get("/about",(req,res)=>{
    res.render("about");
});

// Route to handle the htmlDemo page
app.get("/htmlDemo",(req,res)=>{
    res.render("htmlDemo");
});

// Route to handle the addStudent page
app.get("/students/add",(req,res)=>{
    collegeData.getCourses()
        .then((data) => {
            res.render("addStudent", { courses: data });
        })
        .catch(() => {
            res.render("addStudent", { courses: [] });
        });
});

// Route to handle adding a new student
app.post("/students/add", (req, res) => {
    collegeData.addStudent(req.body)
      .then(() => {
        res.redirect('/students');
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('Error adding student');
    });
});

// Route to handle updating an existing student
app.post("/student/update", (req, res) => { 
    collegeData.updateStudent(req.body)
        .then(() => {
            res.redirect("/students");
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error updating student");
        });
});

// Route to handle the addStudent page
app.get("/courses/add",(req,res)=>{
    res.render("addCourse");
});

// Route to handle adding a new student
app.post("/courses/add", (req, res) => {
    collegeData.addCourse(req.body)
      .then(() => {
        res.redirect('/courses');
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('Error adding course');
    });
});

// Route to handle updating an existing student
app.post("/course/update", (req, res) => { 
    collegeData.updateCourse(req.body)
        .then(() => {
            res.redirect("/courses");
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error updating course");
        });
});

// Add the /course/delete/:id route
app.get('/course/delete/:id', (req, res) => {
    const id = req.params.id;
    collegeData.deleteCourseById(id)
        .then(() => res.redirect('/courses'))
        .catch(() => res.status(500).send("Unable to Remove Course / Course not found"));
});

// Route to handle deleting a student by their student number
app.get("/student/delete/:studentNum", (req, res) => {
    const studentNum = req.params.studentNum;

    collegeData.deleteStudentByNum(studentNum)
        .then(() => {
            res.redirect("/students");
        })
        .catch(err => {
            res.status(500).send("Unable to Remove Student / Student not found: " + err);
        });
});

// Error handling middleware
app.use((req,res)=>{
    res.status(404).send("Page Not THERE, Are you sure of the path?");
});

// setup http server to listen on HTTP_PORT
collegeData.initialize().then(() => {
    app.listen(HTTP_PORT,()=>{
        console.log("server listening on port:" + HTTP_PORT);
    });
}).catch((err) => {
        console.error("Failed to initialize the data", err);
});
    

