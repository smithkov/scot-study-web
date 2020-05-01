var express = require("express");
var Model = require("../config/database");
const { QueryTypes } = require('sequelize');
var crypto = require("crypto");
var router = express.Router();
var User = require("../models").User;
var bcrypt = require("bcryptjs");
var passport = require("passport");
var Course = require("../models").Course;
var Institution = require("../models").Institution;
var StudyArea = require("../models").StudyArea;
var Application = require("../models").Application;
var Query = require("../queries/query");
var Logo = require("../models").Logo;
var Banner = require("../models").Banner;
var config = require("../my_modules/config");
const mail = require("../my_modules/mailer");
var async = require("async");
const bestSelling = "BEST SELLING COURSES";
router.get("/", async function (req, res) {
  //let courses = await Query.Course.findAll();

  //let studyAreas = await Query.StudyArea.findAll();

  let populars = await Query.Course.findByPopular();
  let cities = await Query.City.findAll();

  let institutions = await Query.Institution.findAll();

  let banner = await Query.Banner.activeBanners();
  res.render("index", {
    banner: banner,
    //courses: courses.length,
    institutions: institutions.length,
    schools: institutions,
    //faculties: studyAreas.length,
    city: cities.length,
    best: bestSelling,
    data: populars
  });
});

function uniq(a) {
  return Array.from(new Set(a));
}

function getSchoolAndFaculty() {
  return schoolArray;
}
router.post("/courseListingMobile", async function (req, res, next) {
  let offset = req.body.offsetData;
  let limit = req.body.limitData;
  let searchParam = req.body.searchParam;

  let course = await Query.Course.findPaginated(offset, limit, searchParam);

  res.send({ data: course });
});
router.get("/data", function (req, res) {
  try {
    Query.Institution.paginatedFindAll().then(
      schools => {
        return res.send({
          auth: false,
          token: null,
          error: false,
          data: schools
        });
      },
      error => {

      }
    );
  } catch (err) {

  }
});
router.post("/getCoursesByFaculty", async (req, res) => {
  let schoolId = req.body.schoolId;
  let facultyId = req.body.facultyId;
  let coursesByFaculty = await Query.Course.findByFacultyId(
    facultyId,
    schoolId
  );
  return res.send({
    success: true,
    data: coursesByFaculty
  });
});

router.get("/schoolsMobile", async (req, res) => {
  // var schoolArray = [];
  // var schools = await Query.Institution.findAll();
  // var fac = [];
  // for (var i = 0; i < schools.length; i++) {
  //   let course = await Query.Course.findByInstitutionId(schools[i].id);

  //   for (var j = 0; j < course.length; j++) {
  //     fac.push(course[j].StudyArea.id);
  //   }
  //   let filterIds = uniq(fac);
  //   fac = [];
  //   for (var u = 0; u < filterIds.length; u++) {
  //     let getById = await Query.StudyArea.findById(filterIds[u]);
  //     let coursesByFaculty = await Query.Course.findByFacultyId(
  //       getById.id,
  //       schools[i].id
  //     );
  //     fac.push({ fac: getById, num: coursesByFaculty.length });
  //   }
  //   schoolArray.push({ uni: schools[i], faculty: fac });
  //   fac = [];
  // }
  var schoolArray = [];
  var schools = await Query.Institution.findAll();
  var fac = [];

  for (var i = 0; i < schools.length; i++) {
    let getSurrogateFaculty = await Query.SurrogateFaculty.findByInstitution(
      schools[i].id
    );
    if (getSurrogateFaculty.length > 0) {
      getSurrogateFaculty.forEach(school => {
        fac.push(school);
      });
      schoolArray.push({ uni: schools[i], faculty: fac });
    }

    fac = [];
  }

  return res.send({
    auth: false,
    token: null,
    error: false,
    data: schoolArray
  });
});

// router.get("/schools", function(req, res) {
//   Query.Course.findByPopular().then(function(populars) {
//     Query.Course.findAll().then(function(course) {
//       res.render("search", { data: populars });
//     });
//   });
// });

router.get("/institutions", async function (req, res) {
  let populars = await Query.Course.findByPopular();
  let schools = await Query.Institution.findAll();
  res.render("institutions", {
    data: reduceArray(populars),
    schools:schools,
    best: bestSelling
  });
});

router.get("/compare-fees", async function (req, res) {
  let populars = await Query.Course.findByPopular();
  //let courses = await Query.Course.findAll();
  // let degreeTypes = await Query.DegreeType.findAll();
  // let institution = await Query.Institution.findAll();
  // let faculty = await Query.StudyArea.findAll();
  res.render("compare", {

    best: bestSelling,

    data: reduceArray(populars)
  });
});

function reduceArray(arr) {
  let newArr = [];
  for (let i = 0; i < 4; i++) {
    newArr.push(arr[i]);
  }
  return newArr;
}
router.get("/courses", async function (req, res) {
  let populars = await Query.Course.findByPopular();
  let courses = await Query.Course.findAll();

  res.render("course", {
    courses: courses,
    best: bestSelling,
    data: reduceArray(populars)
  });
});

router.get("/getCourses", async function (req, res) {
  let courses = await Query.Course.findAll();
  return res.send({
    data: courses
  });
});

router.get("/forgot", async function (req, res) {
  res.render("forgot");
});


router.post("/forgot", async function (req, res, next) {
  let email = req.body.email;



  crypto.randomBytes(20, async function (err, buf) {
    var token = buf.toString('hex');
    let user = await Query.User.findByEmail(email);
    if (!user) {
      req.flash('error_msg', 'No account with that email address exists.');
      return res.redirect('/forgot');
    }

    let id = user.id;
    var newUser = {
      id: user.id,
      resetPasswordToken: token,
      resetPasswordExpires: Date.now() + 3600000
    };
    let update = await Query.User.update(newUser, id);

    let message = 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
      'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
      'http://' + req.headers.host + '/reset/' + token + '\n\n' +
      '<br/> If you did not request this, please ignore this email and your password will remain unchanged.\n'

    if (!mail.send(user.email, "Reset Password (Scot-Study)", message)) {
      req.flash('success_msg', 'An e-mail has been sent to ' + user.email + ' with further instructions.');

    } else {
      req.flash('error_msg', 'We could not process your request');
    }
    res.redirect('/forgot');
  });

});

router.get('/reset/:token', async function (req, res) {
  let token = req.params.token;
  let getUser = await Query.User.resetPassword(token);

  if (!getUser) {
    req.flash('error_msg', 'Password reset token is invalid or has expired.');
    return res.redirect('/forgot');
  } else

    res.render('reset', { token: token });
});

router.post('/reset/:token', async function (req, res) {
  let token = req.params.token;
  let newPassword = req.body.newPass;
  var getUser = await Query.User.resetPassword(token);
  let id = getUser.id;
  let newUser = {
    resetPasswordToken: null,
    resetPasswordExpires: null,
    password: getUser.password,
    id: id
  }

  if (!getUser) {
    req.flash('error', 'Password reset token is invalid or has expired.');
    return res.redirect('/forgot');
  }
  if (newPassword === req.body.confirmPass) {
    bcrypt.genSalt(4, async function (err, salt) {
      bcrypt.hash(newPassword, salt, async function (err, hash) {
        newUser.password = hash;
        // create that user as no one by that username exists
        let update = await Query.User.update(newUser, id);
         
        if (update) {
          
          let message = 'Hello,\n\n' + 'This is a confirmation that the password for your account ' + getUser.email + ' has just been changed.\n'
          mail.send(getUser.email, "Password Changed (Scot-Study)", message)
          req.flash('success_msg', 'Success! Your password has been changed.');
          res.redirect('/user/login');
        } else {
          req.flash('error_msg', 'Oops! Something went wrong. Kindly contact us.');
          res.redirect('back');
        }
      });
    });
  } else {
    req.flash('error_msg', 'Passwords do not match.');
    return res.redirect('back');
  }

});
router.get("/dropDown", async function (req, res) {

  //const faculty = await Model.query("SELECT  DISTINCT name, originalId FROM StudyAreas", { type: QueryTypes.SELECT });
  let degreeTypes = await Query.DegreeType.findAll();
  const faculty = await Query.CacheFaculty.findAll();

  let institutions = await Query.Institution.findAll();
  return res.send({
    data: {
      faculty: faculty,
      degree: degreeTypes,
      institutions: institutions
    }
  });
});

router.post("/courseSearch", async function (req, res) {
  let degreeId = req.body.degreeId;
  let facultyId = req.body.facultyId;
  let institutionId = req.body.institutionId;

  let course = await Query.Course.courseSearch(
    degreeId,
    facultyId,
    institutionId
  );
  return res.send({
    data: course
  });
});

router.post("/popular", async function (req, res) {
  let degreeId = req.body.degreeId;
  let facultyId = req.body.facultyId;
  let institutionId = req.body.institutionId;
  let popular = await Query.Course.findPopular(
    degreeId,
    facultyId,
    institutionId
  );
  return res.send({
    data: popular
  });
});

router.get("/popular-Courses", async function (req, res) {
  res.render("popular");
});
router.post("/compareFee", async function (req, res) {
  let institutionId = req.body.institutionId1;
  let institutionId2 = req.body.institutionId2;
  let facultyId = req.body.facultyId;
  let degreeTypeId = req.body.degreeTypeId;
  let offSet1 = req.body.offSetOne;
  let offSet2 = req.body.offSetTwo;


  let courseForInstitution1 = await Query.Course.findByInstitutionIdSearch(
    institutionId,
    facultyId,
    degreeTypeId,
    offSet1
  );
  let courseForInstitution2 = await Query.Course.findByInstitutionIdSearch(
    institutionId2,
    facultyId,
    degreeTypeId,
    offSet2
  );
  return res.send({
    data: { course1: courseForInstitution1, course2: courseForInstitution2 }
  });
});

router.post("/compareFeeSingle", async function (req, res) {
  let institutionId = req.body.institutionId;
  let facultyId = req.body.facultyId;
  let pageNext = req.body.pageNext;
  let limit = req.body.limit;

  let courseForInstitution = await Query.Course.findByInstitutionIdSearch(
    institutionId,
    facultyId,
    pageNext,
    limit
  );

  return res.send({
    data: courseForInstitution
  });
});

router.get("/about", async function (req, res) {
  // let course = await Query.Course.findAll();
  // for (var i = 0; i < course.length; i++) {
  //   console.log(i);
  //   let path = course[i].path.split(".");
  //   path.pop();
  //   path.pop();
  //   path = path + ".png";
  //   console.log("--------------------------------");
  //   console.log(path);

  //   let update = await Query.Course.update({ path: path }, course[i].id);
  // }
  let populars = await Query.Course.findByPopular();
  res.render("about", { data: reduceArray(populars), best: bestSelling });
});

router.get("/pre-departure", async function (req, res) {
  let desc = "Pre-Departure Guideline";
  let populars = await Query.Course.findByPopular();
  let departure = await Query.Departure.findAll();
  res.render("richTextTemp", {
    app: departure[0],
    description: desc,
    best: bestSelling,
    data: reduceArray(populars)
  });
});

router.get("/visa-application-guideline", function (req, res) {
  let desc = "Visa Application Guideline";
  Query.Guideline.findAll().then(function (guide) {
    res.render("richTextTemp", {
      app: guide[0],
      description: desc
    });
  });
});

router.get("/why-us", (req, res) => {
  Query.Course.findByPopular().then(function (populars) {
    res.render("whyChoose", { data: reduceArray(populars), best: bestSelling });
  });
});

router.get("/contact-us", (req, res) => {
  Query.Course.findByPopular().then(function (populars) {
    res.render("contactUs", { data: reduceArray(populars), best: bestSelling });
  });
});

router.get("/scholarship", (req, res) => {
  Query.Course.findByPopular().then(function (populars) {
    res.render("scholarship", {
      data: reduceArray(populars),
      best: bestSelling
    });
  });
});

router.get("/about-scotland", (req, res) => {
  Query.Course.findByPopular().then(function (populars) {
    res.render("aboutScotland", {
      data: reduceArray(populars),
      best: bestSelling
    });
  });
});

router.get("/checklist", ensureAuthenticated, (req, res) => {
  res.render("checklist", {
    layout: "layoutDashboard.handlebars",
    user: req.user
  });
});

router.get("/help", ensureAuthenticated, (req, res) => {
  res.render("help", {
    layout: "layoutDashboard.handlebars",
    user: req.user
  });
});

router.get("/detail/:school/:course/:id", async (req, res) => {
  let id = req.params.id;
  let populars = await Query.Course.findByPopular();
  let course = await Query.Course.findById(id);
  res.render("course_detail", {
    data: reduceArray(populars),
    best: bestSelling,
    course: course
  });
});

router.get("/school-courses/:name/:_id", async function (req, res, next) {
  //let populars, institutions;
  let Schoolname = req.params.name;
  let id = req.params._id;

  let populars = await Query.Course.findByPopular();
  let courseByInstitution = await Query.Course.findByInstitutionId(id);
  res.render("schoolCourses", {
    courses: courseByInstitution,
    name: Schoolname,
    data: reduceArray(populars),
    best: bestSelling
  });
});

router.get("/school-faculties/:name/:_id", async function (req, res, next) {
  let facultyName = req.params.name;
  let id = req.params._id;

  Query.Course.findByPopular().then(async function (populars) {
    let courseByInstitution = await Query.Course.findByInstitutionId(id);
    let InstitutionById = await Query.Institution.findById(id);
    var faculty = [];
    var facultyCourse = [];
    courseByInstitution.forEach(course => {
      faculty.push(course.StudyArea.id);
    });

    let filterIds = uniq(faculty);
    for (var i = 0; i < filterIds.length; i++) {
      let courses = await Query.Course.findCourseByFacultyAndSchool(
        filterIds[i],
        id
      );
      facultyCourse.push({
        faculty: courses[0],
        course: courses
      });
    }

    res.render("search_faculty", {
      faculties: facultyCourse,
      name: facultyName,
      data: reduceArray(populars),
      best: bestSelling,
      school: InstitutionById
    });
  });
});

router.post("/faculty-courses", async (req, res) => {
  let schoolId = req.body.schoolId;
  let courseByInstitution = await Query.Course.findByInstitutionId(schoolId);
  let InstitutionById = await Query.Institution.findById(schoolId);
  var faculty = [];
  var facultyCourse = [];
  courseByInstitution.forEach(course => {
    faculty.push(course.StudyArea.id);
  });
  let filterIds = uniq(faculty);
  for (var i = 0; i < filterIds.length; i++) {
    console.log("1");
    let courses = await Query.Course.findCourseByFacultyAndSchool(
      filterIds[i],
      schoolId
    );
    facultyCourse.push({
      faculty: courses[0].StudyArea.name,
      course: courses
    });
  }

  return res.send({
    auth: false,
    token: null,
    error: false,
    data: facultyCourse
  });
});

router.get("/faculty/:_id/:schoolId", async (req, res) => {
  let facultyId = req.params._id;
  let schoolId = req.params.schoolId;
  let courseByFaculty = await Query.Course.findByFacultyId(facultyId, schoolId);
  let populars = await Query.Course.findByPopular();

  res.render("faculty", {
    facultyName: courseByFaculty[0].StudyArea.name,
    data: reduceArray(populars),
    best: bestSelling,
    school: courseByFaculty[0].Institution,
    courses: courseByFaculty
  });
});

router.get("/dashboard", ensureAuthenticated, async function (req, res) {
  //let courses = await Query.Course.findAll();
  //let institutions = await Query.Institution.findAll();
  let isAdmin = req.user.roleId;
  if (isAdmin) {
    let submittedApplication = await Query.Application.findBySubmitted();
    const mappedApplication = submittedApplication.map(app=>{
      const fullName = `${app.firstname} ${app.middlename} ${app.lastname}`
      return {fullName: fullName, userId:app.User.id, nationality: app.Country.name, date: config.formatDate(app.createdAt)}
    })

    //let allApplications = await Query.Application.findAll();

    let unread = await Query.Mail.findAdminUnreadMessages(req.user.id);

    let hasBadge = unread.length > 0 ? true : false;
    res.render("dashboard", {
      layout: "layoutDashboard.handlebars",
      //instLim: institutions,
      unreadNum: unread.length,
      hasBadge: hasBadge,
      submitted: mappedApplication
    });
  } else {
    let app = await Query.Application.findByUser(req.user.id);

    let applicationPercentage = 0;
    let isShowProgress = true;
    let counter = 0;
    let max = 26;
    if (app && app.hasSubmitted) {
      counter = 26;
    } else if (app) {
      app.firstname = !app.firstname || counter++;
      app.lastname = !app.lastname || counter++;
      app.dob = !app.dob || counter++;
      app.gender = !app.gender || counter++;
      app.marital = !app.marital || counter++;
      app.homeAddress = !app.homeAddress || counter++;
      app.phone = !app.phone || counter++;
      app.hGrade = !app.hGrade || counter++;
      app.hSchoolName = !app.hSchoolName || counter++;
      app.hCompleted = !app.hCompleted || counter++;
      app.hProgrammeYear = !app.hProgrammeYear || counter++;
      app.pQualification = !app.pQualification || counter++;
      app.pGrade = !app.pGrade || counter++;
      app.pSchoolName = !app.pSchoolName || counter++;
      app.pCompleted = !app.pCompleted || counter++;
      app.pProgrammeYear = !app.pProgrammeYear || counter++;
      app.highSchoolName = !app.highSchoolName || counter++;
      app.completionYr = !app.completionYr || counter++;
      app.englishTest = !app.englishTest || counter++;
      app.sponsor = !app.sponsor || counter++;
      app.sponsorName = !app.sponsorName || counter++;
      app.sponsorOccupation = !app.sponsorOccupation || counter++;
      app.budget = !app.budget || counter++;
      app.credential = !app.credential || counter++;
      app.hQualification = !app.hQualification || counter++;
      app.pQualification = !app.pQualification || counter++;
    } else {
      isShowProgress = false;
    }

    applicationPercentage = (counter / max) * 100;

    res.render("dashboard", {
      layout: "layoutDashboard.handlebars",
      user: req.user,
      showProgress: isShowProgress,
      appPercentage: parseInt(applicationPercentage),
      app: app
    });
  }
  // });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    //req.flash('error_msg','You are not logged in');
    res.redirect("/user/login");
  }
}

module.exports = router;
