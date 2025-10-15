const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");

// Use SQLite locally (no credentials)
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "../data/college.db"),
  logging: false
});

// MODELS
const Student = sequelize.define("Student", {
  studentNum: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  email: DataTypes.STRING,
  addressStreet: DataTypes.STRING,
  addressCity: DataTypes.STRING,
  addressProvince: DataTypes.STRING,
  TA: DataTypes.BOOLEAN,
  status: DataTypes.STRING,
  course: DataTypes.INTEGER
});

const Course = sequelize.define("Course", {
  courseId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  courseCode: DataTypes.STRING,
  courseDescription: DataTypes.STRING
});

Course.hasMany(Student, { foreignKey: "course" });

// INIT
async function initialize() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    return true;
  } catch (e) {
    console.error("initialize() error:", e);
    throw new Error("unable to sync the database: " + (e?.message || e));
  }
}

// ---------- STUDENTS ----------
function getAllStudents() {
  return Student.findAll({ order: [["studentNum", "ASC"]], raw: true });
}

function getStudentsByCourse(courseId) {
  return Student.findAll({
    where: { course: courseId },
    order: [["studentNum", "ASC"]],
    raw: true
  });
}

function getStudentByNum(studentNum) {
  return Student.findOne({ where: { studentNum }, raw: true });
}

async function addStudent(studentData) {
  // normalize
  studentData.TA = !!studentData.TA;
  for (const k in studentData) {
    if (typeof studentData[k] === "string") {
      studentData[k] = studentData[k].trim();
      if (studentData[k] === "") studentData[k] = null;
    }
  }
  if (studentData.course != null) {
    const n = parseInt(studentData.course, 10);
    studentData.course = Number.isNaN(n) ? null : n;
  }
  await Student.create(studentData);
}

async function updateStudent(studentData) {
  studentData.TA = !!studentData.TA;
  for (const k in studentData) {
    if (typeof studentData[k] === "string") {
      studentData[k] = studentData[k].trim();
      if (studentData[k] === "") studentData[k] = null;
    }
  }
  if (studentData.course != null) {
    const n = parseInt(studentData.course, 10);
    studentData.course = Number.isNaN(n) ? null : n;
  }
  const { studentNum, ...rest } = studentData;
  await Student.update(rest, { where: { studentNum } });
}

function deleteStudentByNum(studentNum) {
  return Student.destroy({ where: { studentNum } });
}

// ---------- COURSES ----------
function getCourses() {
  return Course.findAll({ order: [["courseId", "ASC"]], raw: true });
}

function getCourseById(id) {
  return Course.findOne({ where: { courseId: id }, raw: true });
}

async function addCourse(courseData) {
  for (const k in courseData) {
    if (typeof courseData[k] === "string") {
      courseData[k] = courseData[k].trim();
      if (courseData[k] === "") courseData[k] = null;
    }
  }
  await Course.create(courseData);
}

async function updateCourse(courseData) {
  for (const k in courseData) {
    if (typeof courseData[k] === "string") {
      courseData[k] = courseData[k].trim();
      if (courseData[k] === "") courseData[k] = null;
    }
  }
  const { courseId, ...rest } = courseData;
  await Course.update(rest, { where: { courseId } });
}

function deleteCourseById(id) {
  return Course.destroy({ where: { courseId: id } });
}

module.exports = {
  initialize,
  getAllStudents,
  getStudentsByCourse,
  getStudentByNum,
  addStudent,
  updateStudent,
  deleteStudentByNum,
  getCourses,
  getCourseById,
  addCourse,
  updateCourse,
  deleteCourseById
};
