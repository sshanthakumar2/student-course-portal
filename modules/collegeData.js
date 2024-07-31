const Sequelize = require('sequelize'); 

var sequelize = new Sequelize('dfmgti24doliki', 'u1a6pv3kkallus', 'p204894bd5533fe6374c2b0d475bb7f719693929e3d6a1c8bde426ce84a3082a6', { 
 host: 'ccpa7stkruda3o.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com', 
 dialect: 'postgres', 
 port: 5432, 
 dialectOptions: { 
 ssl: { rejectUnauthorized: false } 
 }, 
 query:{ raw: true } 
}); 

const Student = sequelize.define('Student', {
    studentNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    TA: Sequelize.BOOLEAN,
    status: Sequelize.STRING
});

const Course = sequelize.define('Course', {
    courseId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseCode: Sequelize.STRING,
    courseDescription: Sequelize.STRING
});

Course.hasMany(Student, { foreignKey: 'course' });

// Initialize the data by reading from JSON files
module.exports.initialize = function () {
    return new Promise(function (resolve, reject) { 
        sequelize.sync()
            .then(() => resolve())
            .catch(() => reject("unable to sync the database"));
       }); 
}

// Get all students from the data collection
module.exports.getAllStudents = function(){
    return new Promise(function (resolve, reject) { 
        Student.findAll()
            .then(data => resolve(data))
            .catch(() => reject("no results returned"));
       }); 
}

// Get all courses from the data collection
module.exports.getCourses = function(){
    return new Promise(function (resolve, reject) { 
        Course.findAll()
            .then(data => resolve(data))
            .catch(() => reject("no results returned"));
       }); 
};

module.exports.getStudentByNum = function (num) {
    return new Promise((resolve, reject) => {
        Student.findAll({
            where: { studentNum: num }
        })
        .then(data => {
            if (data.length > 0) {
                console.log("Student found:", data[0]);
                resolve(data[0]);
            } else {
                console.log("No student found with number:", num);
                reject("no results returned");
            }
        })
        .catch(err => {
            console.error("Error in getStudentByNum:", err);
            reject("no results returned");
        });
    });
};

// Get students filtered by a specific course
module.exports.getStudentsByCourse = function (course) {
    return new Promise(function (resolve, reject) { 
        Student.findAll({
            where: { course: course }
        })
            .then(data => resolve(data))
            .catch(() => reject("no results returned"));
       }); 
};

// Add a new student to the data collection
module.exports.addStudent = function (studentData) {
    studentData.TA = (studentData.TA) ? true : false;
    for (let prop in studentData) {
        if (studentData[prop] === "") studentData[prop] = null;
    }
    return new Promise(function (resolve, reject) { 
        Student.create(studentData)
            .then(() => resolve())
            .catch(() => reject("unable to create student"));
       }); 
};

// Get a specific course by its ID
module.exports.getCourseById = function (id) {
    return new Promise(function (resolve, reject) { 
        Course.findAll({
            where: { courseId: id }
        })
            .then(data => resolve(data[0]))
            .catch(() => reject("no results returned"));
       }); 
};

// Update an existing student's information
module.exports.updateStudent = function (studentData) {
    studentData.TA = (studentData.TA) ? true : false;
    for (let prop in studentData) {
        if (studentData[prop] === "") studentData[prop] = null;
    }
    return new Promise(function (resolve, reject) { 
        Student.update(studentData, {
            where: { studentNum: studentData.studentNum }
        })
            .then(() => resolve())
            .catch(() => reject("unable to update student"));
       }); 
};

// Add a new course to the data collection
module.exports.addCourse = function (courseData) {
    for (let prop in courseData) {
        if (courseData[prop] === "") courseData[prop] = null;
    }
    return new Promise(function (resolve, reject) { 
        Course.create(courseData)
            .then(() => resolve())
            .catch(() => reject("unable to create course"));
    }); 
}

// Update an existing course's information
module.exports.updateCourse = function (courseData) {
    for (let prop in courseData) {
        if (courseData[prop] === "") courseData[prop] = null;
    }
    return new Promise(function (resolve, reject) { 
        Course.update(courseData, {
            where: { courseId: courseData.courseId }
        })
            .then(() => resolve())
            .catch(() => reject("unable to update course"));
    }); 
}

// Delete a course by its ID
module.exports.deleteCourseById = function (id) {
    return new Promise(function (resolve, reject) { 
        Course.destroy({
            where: { courseId: id }
        })
            .then(() => resolve())
            .catch(() => reject("unable to delete course"));
    }); 
}

// Delete a student by their student number
module.exports.deleteStudentByNum = function (studentNum) {
    return new Promise(function (resolve, reject) { 
        Student.destroy({
            where: { studentNum: studentNum }
        })
            .then(deletedCount => {
                if (deletedCount === 0) {
                    return reject("Student not found");
                }
                resolve();
            })
            .catch(err => reject("Unable to delete student: " + err));
    });
}

