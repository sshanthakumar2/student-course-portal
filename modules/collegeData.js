const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");

const isProd = process.env.NODE_ENV === "production";
const storagePath = isProd
  ? "/tmp/college.db"                             // Vercel writable temp dir (ephemeral)
  : path.join(__dirname, "../data/college.db");   // local persistent

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: storagePath,
  logging: false
});

// Models
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

// Init
async function initialize() {
  await sequelize.authenticate();
  await sequelize.sync();
  return true;
}

// READS: return plain objects so Handlebars can access without proto warnings
function getAllStudents() {
  return Student.findAll({ order: [["studentNum", "ASC"]], raw: true });
}
function getStudentsByCourse(courseId) {
  return Student.findAll({ where: { course: courseId }, order: [["studentNum", "ASC"]], raw: true });
}
function getStudentByNum(studentNum) {
  return Student.findOne({ where: { studentNum }, raw: true });
}
function getCourses() {
  return Course.findAll({ order: [["courseId", "ASC"]], raw: true });
}
function getCourseById(id) {
  return Course.findOne({ where: { courseId: id }, raw: true });
}

// WRITES: normalize inputs
async function addStudent(studentData) {
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
