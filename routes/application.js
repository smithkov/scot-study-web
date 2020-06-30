const express = require("express");
const router = express.Router();
const Application = require("../queries/query").Application;
const Course = require("../queries/query").Course;
const Qualification = require("../queries/query").Qualification;
const Institution = require("../queries/query").Institution;
const City = require("../queries/query").City;
const Country = require("../queries/query").Country;
const config = require("../my_modules/config");
const isAdmin = config.isAdmin;
const ensureAuthenticated = config.ensureAuthenticated;
const ObjectID = require("mongodb").ObjectID;
const Query = require("../queries/query");
const mail = require("../my_modules/mailer");

const url = require("url");
const entityName = "application";
const year = [];

function apiMsg(isError) {
  return isError
    ? "Application could not be saved successfully!"
    : "Application was saved successfully!";
}
function getYear() {
  var d = new Date();
  var y = d.getFullYear();
  for (var i = 1960; i <= y; i++) {
    year.push(i);
  }
  return year;
}
router.post("/mobileStep1", async function (req, res, next) {
  let currentUserId = req.body.userId;
  let application = await Application.findByUser(currentUserId);
  let quali = await Qualification.findAll();
  // let course = await Course.findAll();
  let city = await City.findAll();
  //let institution = await Institution.findAll();
  let country = await Country.findAll();

  let getCourse = application
    ? await Query.Course.findById(application.courseId)
    : "";
  return res.send({
    //courses: course,
    quali: quali,
    cities: city,
    course: getCourse,
    //institutions: institution,
    countries: country,
    app: application,
  });
});

router.get("/step1", ensureAuthenticated, async function (req, res, next) {
  //if(req.user.roleId){
  let currentUserId = req.user.id;

  let application = await Application.findByUser(currentUserId);
  let quali = await Qualification.findAll();
  let course = await Course.findAll();
  let city = await City.findAll();
  let institution = await Institution.findAll();
  let country = await Country.findAll();
  if (application && application.hasSubmitted) res.redirect("/dashboard");
  else {
    res.render("step1", {
      layout: "layoutDashboard.handlebars",
      courses: course,
      quali: quali,
      year: getYear(),
      cities: city,
      institutions: institution,
      countries: country,
      app: application,
      user: req.user,
    });
  }
});

router.get("/step2", ensureAuthenticated, async function (req, res, next) {
  //if(req.user.roleId){
  let currentUserId = req.user.id;
  let application = await Application.findByUser(currentUserId);
  let currentEmail = application.contactEmail;
  application.contactEmail = currentEmail || req.user.email;

  let quali = await Qualification.findAll();
  let course = await Course.findAll();
  let city = await City.findAll();
  let institution = await Institution.findAll();
  let country = await Country.findAll();
  if (application && application.hasSubmitted) res.redirect("/dashboard");
  else
    res.render("step2", {
      layout: "layoutDashboard.handlebars",
      courses: course,
      quali: quali,
      year: getYear(),
      cities: city,
      institutions: institution,
      countries: country,
      app: application,
      user: req.user,
    });
});

router.get("/step3", ensureAuthenticated, async function (req, res, next) {
  //if(req.user.roleId){
  let currentUserId = req.user.id;
  let application = await Application.findByUser(currentUserId);
  let quali = await Qualification.findAll();
  let course = await Course.findAll();
  let city = await City.findAll();
  let institution = await Institution.findAll();
  let country = await Country.findAll();
  if (application && application.hasSubmitted) res.redirect("/dashboard");
  else {
    res.render("step3", {
      layout: "layoutDashboard.handlebars",
      courses: course,
      quali: quali,
      year: getYear(),
      cities: city,
      institutions: institution,
      countries: country,
      app: application,
      user: req.user,
    });
  }
});

router.get("/step4", ensureAuthenticated, async function (req, res, next) {
  //if(req.user.roleId){
  let currentUserId = req.user.id;
  let application = await Application.findByUser(currentUserId);
  let quali = await Qualification.findAll();
  let course = await Course.findAll();
  let city = await City.findAll();
  let institution = await Institution.findAll();
  let country = await Country.findAll();
  if (application && application.hasSubmitted) res.redirect("/dashboard");
  else
    res.render("step4", {
      layout: "layoutDashboard.handlebars",
      courses: course,
      quali: quali,
      year: getYear(),
      cities: city,
      institutions: institution,
      countries: country,
      app: application,
      user: req.user,
    });
});

router.get("/step5", ensureAuthenticated, async function (req, res, next) {
  //if(req.user.roleId){
  let currentUserId = req.user.id;
  let application = await Application.findByUser(currentUserId);
  let quali = await Qualification.findAll();
  let course = await Course.findAll();
  let city = await City.findAll();
  let institution = await Institution.findAll();
  let country = await Country.findAll();
  if (application && application.hasSubmitted) res.redirect("/dashboard");
  else
    res.render("step5", {
      layout: "layoutDashboard.handlebars",
      courses: course,
      quali: quali,
      year: getYear(),
      cities: city,
      institutions: institution,
      countries: country,
      app: application,
      user: req.user,
    });
});

router.get("/applicationByUser/:id", ensureAuthenticated, function (
  req,
  res,
  next
) {
  //if(req.user.roleId){
  let id = req.params.id;
  Application.findByUser(id).then((application) => {
    res.render("finish", {
      layout: "layoutDashboard.handlebars",
      app: application,
      user: req.user,
    });
  });
});

router.get("/finish", ensureAuthenticated, async function (req, res, next) {
  //if(req.user.roleId){
  let currentUserId = req.user.id;
  let country = await Country.findAll();
  let application = await Application.findByUser(currentUserId);
  let quali = await Qualification.findAll();
  let courses = await Course.findAll();
  let city = await City.findAll();
  let institution = await Institution.findAll();
  if (!application.hasSubmitted) {
    res.render("finish", {
      layout: "layoutDashboard.handlebars",
      app: application,
      countries: country,
      quali: quali,
      year: getYear(),
      cities: city,
      institutions: institution,
      courses: courses,
      user: req.user,
    });
  } else {
    res.redirect("/dashboard");
  }
});

router.get("/applicants", ensureAuthenticated, isAdmin, async (req, res) => {
  try {
    let applications = await Application.findAll();
    let id = 1;

    const getApplicants = applications.map((app, idx, apps) => {
      const fullName = `${app.firstname} ${app.middlename} ${app.lastname}`;

      let mappedApplication = {
        serial: id++,
        id: app.id,
        fullName: fullName,
        status: app.hasSubmitted,
        decision: app.decision,
        userId: app.User ? app.User.id : "",
        date: config.formatDate(app.createdAt),
      };

      //mappedApplication.id = id++;
      //mappedApplication.createdAt = config.formatDate(applicant.createdAt);
      return mappedApplication;
    });

    res.render("applicantList", {
      layout: "layoutDashboard.handlebars",
      app: getApplicants,
      user: req.user,
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/read-Application", ensureAuthenticated, async function (
  req,
  res,
  next
) {
  let applications = await Query.Application.findByUser(req.user.id);
  res.render("readApplication", {
    layout: "layoutDashboard.handlebars",
    app: applications,
    user: req.user,
  });
});

router.get("/Update/:id", ensureAuthenticated, function (req, res, next) {
  let id = req.params.id;
  Application.findById(id).then((data) => {
    res.render("update", {
      layout: "layoutDashboard.handlebars",
      user: req.user,
      data: data,
      user: req.user,
      entity: entityName,
    });
  });
});

// router.get('/submitMsg',ensureAuthenticated, function(req, res, next) {
//
//       res.render('applicationMsg',{layout: 'layoutDashboard.handlebars',user:req.user});
//
// });

router.get("/delete/:id", ensureAuthenticated, function (req, res, next) {
  let id = req.params.id;
  Application.delete(id).then((data) => {
    res.redirect("/listing");
  });
});

router.get("/hide/:id", ensureAuthenticated, async (req, res, next) => {
  try {
    let id = req.params.id;
    const getApplication = await Query.Application.findById(id);
    if (getApplication)
      await Query.Application.update({ hasDeleted: true }, id);
  } catch (err) {
    console.log(err);
  } finally {
    res.redirect("/application/applicants");
  }
});

router.post(
  "/finalSubmit",
  config.cpUpload2,
  ensureAuthenticated,
  async function (req, res, next) {
    let applicationId = req.body.id;
    let firstname = req.body.firstname;
    let middlename = req.body.middlename;
    let lastname = req.body.lastname;
    let countryId = req.body.countryId;
    let dob = req.body.dob;
    let gender = req.body.gender;
    let marital = req.body.marital;
    let contactEmail = req.body.contactEmail;
    let userId = req.user.id;
    let homeAddress = req.body.homeAddress;
    let postalAddress = req.body.postalAddress;
    let phone = req.body.phone;
    let hQualification = req.body.hQualification;
    let hGrade = req.body.hGrade;
    let hSchoolName = req.body.hSchoolName;
    let hCompleted = req.body.hCompleted;
    let hProgrammeYear = req.body.hProgrammeYear;
    let pQualification = req.body.pQualification;
    let pGrade = req.body.pGrade;
    let pSchoolName = req.body.pSchoolName;
    let pCompleted = req.body.pCompleted;
    let pProgrammeYear = req.body.pProgrammeYear;
    let highSchoolName = req.body.highSchoolName;
    let completionYr = req.body.completionYr;
    let englishTest = req.body.englishTest;
    let course1 = req.body.course1;
    let course2 = req.body.course2;
    let level = req.body.level;
    let cityOfChoice = req.body.cityOfChoice;
    let schoolWish1 = req.body.schoolWish1;
    let schoolWish2 = req.body.schoolWish2;
    let sponsor = req.body.sponsor;
    let sponsorName = req.body.sponsorName;
    let sponsorOccupation = req.body.sponsorOccupation;
    let budget = req.body.budget;
    let hasApplied = req.body.hasApplied;
    let purpose = req.body.purpose;
    let reasonOfRefusal = req.body.reasonOfRefusal;
    let moreInfo = req.body.moreInfo;
    let credential = req.body.credential;

    console.log(req.body);
    let img =
      req.files["credential"] === undefined
        ? credential
        : req.files["credential"][0].filename;

    let newApplication = {
      id: applicationId,
      firstname: firstname,
      middlename: middlename,
      lastname: lastname,
      contactEmail: contactEmail,
      countryId: countryId,
      dob: dob,
      marital: marital,
      gender: gender,
      userId: userId,
      homeAddress: homeAddress,
      postalAddress: postalAddress,
      phone: phone,
      hQualification: hQualification,
      hGrade: hGrade,
      hSchoolName: hSchoolName,
      hCompleted: hCompleted,
      hProgrammeYear: hProgrammeYear,
      pQualification: pQualification,
      pGrade: pGrade,
      pSchoolName: pSchoolName,
      pCompleted: pCompleted,
      pProgrammeYear: pProgrammeYear,
      highSchoolName: highSchoolName,
      completionYr: completionYr,
      englishTest: englishTest,
      course2: course2,
      course1: course1,
      level: level,
      cityId: cityOfChoice,
      schoolWish1: schoolWish1,
      schoolWish2: schoolWish2,
      sponsor: sponsor,
      sponsorName: sponsorName,
      sponsorOccupation: sponsorOccupation,
      budget: budget,
      hasApplied: hasApplied,
      purpose: purpose,
      reasonOfRefusal: reasonOfRefusal,
      credential: img,
      moreInfo: moreInfo,
      hasSubmitted: true,
      decision: "Pending",
    };

    let getApplication = await Query.Application.findByUser(userId);
    if (applicationId) {
      Application.update(newApplication, applicationId).then((app) => {
        req.flash("success_msg", "Application submission was successful");
        res.redirect("/application/finish");
      });

      res.render("applicationMsg", {
        layout: "layoutDashboard.handlebars",
        user: req.user,
      });
    } else {
      throw new Error("Application error ocuured");
    }
  }
);

router.post("/decision", ensureAuthenticated, isAdmin, function (
  req,
  res,
  next
) {
  let applicationId = req.body.id;
  //let userId = req.body.userId;
  var decision = req.body.decision;
  var reason = req.body.reason;
  let eligibilityCheck = req.body.eligibilityCheck ? true : false;
  let reqProvision = req.body.reqProvision ? true : false;
  let hasFinalSubmit = req.body.hasFinalSubmit ? true : false;
  let hasDecided = decision ? true : false;
  let hasPaid = req.body.hasPaid ? true : false;
  let hasCas = req.body.hasCas ? true : false;

  Application.findById(applicationId).then((data) => {
    var newApplication = {
      id: applicationId,
      decision: decision,
      reqProvision: reqProvision,
      hasFinalSubmit: hasFinalSubmit,
      hasDecided: hasDecided,
      hasPaid: hasPaid,
      hasCas: hasCas,
      eligibilityCheck: eligibilityCheck,
      reasonOfRefusal: reason,
    };

    if (data) {
      Application.update(newApplication, applicationId).then((app) => {
        mail.send(
          data.contactEmail,
          mail.applicationSubject(),
          mail.messageForAppStatus(data.firstname)
        );
        res.redirect("/application/applicants");
      });
    }
  });
});
router.post("/form1", ensureAuthenticated, function (req, res, next) {
  var firstname = req.body.firstname;
  var middlename = req.body.middlename;
  var lastname = req.body.lastname;
  var countryId = req.body.countryId;
  var dob = req.body.dob;
  var gender = req.body.gender;
  var marital = req.body.marital;

  let userId = req.user.id;
  let applicationId = req.body.id;

  var newId = new ObjectID();

  var newApplication = {
    firstname: firstname,
    middlename: middlename,
    lastname: lastname,
    countryId: countryId,
    dob: dob,
    marital: marital,
    gender: gender,
    userId: userId,
  };

  if (applicationId) {
    Application.update(newApplication, applicationId).then((application) => {
      // req.flash('error_msg', 'Something went wrong trying to save the data');
      // res.redirect("/application/step1");
    });
  } else {
    Application.create(newApplication).then((data) => {
      // req.flash('error_msg', 'Something went wrong trying to save the data');
      // res.redirect("/application/step1");
    });
  }
  //req.flash('success_msg', 'Application save successfully');
  res.redirect("/application/step2");
});

router.post("/mobileForm1", async function (req, res, next) {
  let userId = req.body.userId;
  
  try {
    var dataObject;

    let isError = false;

    var firstname = req.body.firstname;
    var middlename = req.body.middlename;
    var lastname = req.body.lastname;
    var courseId = req.body.courseId;
    var getCourseById = await Query.Course.findById(courseId);

    var course1 = getCourseById.name;
    var course2 = getCourseById.name;
    var level = getCourseById.DegreeType.name;
    var cityOfChoice = getCourseById.Institution.CityId;
    var schoolWish1 = getCourseById.Institution.name;
    var schoolWish2 = getCourseById.Institution.name;
    var dob = req.body.dob;
    var gender = req.body.gender;
    var marital = req.body.marital;

    let applicationId = req.body.id;

    var countryId = await Country.findByName(req.body.countryId);

    var newApplication = {
      firstname: firstname,
      userId: userId,
      middlename: middlename,
      lastname: lastname,
      countryId: countryId,
      dob: dob,
      course2: course2,
      course1: course1,
      level: level,
      cityId: cityOfChoice,
      schoolWish1: schoolWish1,
      schoolWish2: schoolWish2,
      courseId: courseId,
      marital: marital,
      gender: gender,
    };
    if (applicationId) {
      dataObject = await Application.update(newApplication, applicationId);
    } else {
      dataObject = await Application.create(newApplication);
    }
    let getApplication = await Query.Application.findByUser(userId);
    //let getApplication = await Query.Application.findByUser(userId);
    //req.flash('success_msg', 'Application save successfully');
    return res.send({
      error: isError,
      message: apiMsg(isError),
      app: getApplication,
    });
  } catch (err) {
    return res.send({
      error: true,
      message: apiMsg(true),
      app: null,
    });
  }
});

router.post("/form2", ensureAuthenticated, function (req, res, next) {
  let homeAddress = req.body.homeAddress;
  let postalAddress = req.body.postalAddress;
  let phone = req.body.phone;
  let contactEmail = req.body.contactEmail;
  let applicationId = req.body.id;

  let isError = false;

  var newApplication = {
    userId: req.user.id,
    homeAddress: homeAddress,
    postalAddress: postalAddress,
    contactEmail: contactEmail,
    phone: phone,
  };

  if (applicationId) {
    newApplication.id = applicationId;
    Application.update(newApplication, applicationId)
      .then((application) => {
        // req.flash('error_msg', 'Something went wrong trying to save the data');
        // res.render("step2");
      })
      .catch((error) => {
        isError = true;
      });
  } else {
    Application.create(newApplication)
      .then((data) => {
        // req.flash('error_msg', 'Something went wrong trying to save the data');
        // res.render("/application/step2");
      })
      .catch((error) => {
        isError = true;
      });
  }
  if (!isError) {
    res.redirect("/application/step3");
  } else {
    new Error("Something went wrong");
  }
});

router.post("/mobileForm2", async function (req, res, next) {
  let userId = req.body.userId;
  let getApplication = await Query.Application.findByUser(userId);
  
  try {
    var dataObject;
    var homeAddress = req.body.homeAddress;
    var postalAddress = req.body.postalAddress;
    var phone = req.body.phone;
    var contactEmail = req.body.contactEmail;
    var applicationId = req.body.id;

    let isError = false;

    var newApplication = {
      userId: userId,
      homeAddress: homeAddress,
      contactEmail: contactEmail,
      postalAddress: postalAddress,
      phone: phone,
    };

    if (applicationId) {
      newApplication.id = applicationId;
      dataObject = await Application.update(newApplication, applicationId);
    } else {
      dataObject = await Application.create(newApplication);
    }

    return res.send({
      error: isError,
      message: apiMsg(isError),
      app: getApplication,
    });
  } catch (err) {
    return res.send({
      error: true,
      message: apiMsg(true),
      app: getApplication,
    });
  }
});

router.put("/removeApplication/:id", async function (req, res, next) {
  let userId = req.body.userId;

  let applicationId = req.params.id;
  let isError = false;
  try {
    var newApplication = {
      hasDeleted: true,
      userId: userId,
      id: applicationId,
    };

    if (applicationId) {
      newApplication.id = applicationId;
      let dataObject = await Application.update(newApplication, applicationId);
    }
  } catch (err) {
    isError = true;
  }
  let getApplication = await Query.Application.findByUser(userId);
  return res.send({
    error: isError,
    message: apiMsg(isError),
    app: getApplication,
  });
});

router.post("/form3", ensureAuthenticated, function (req, res, next) {
  var applicationId = req.body.id;

  var hQualification = req.body.hQualification;
  var hGrade = req.body.hGrade;
  var hSchoolName = req.body.hSchoolName;
  var hCompleted = req.body.hCompleted;
  var hProgrammeYear = req.body.hProgrammeYear;
  var pQualification = req.body.pQualification;
  var pGrade = req.body.pGrade;
  var pSchoolName = req.body.pSchoolName;
  var pCompleted = req.body.pCompleted;
  var pProgrammeYear = req.body.pProgrammeYear;
  var highSchoolName = req.body.highSchoolName;
  var completionYr = req.body.completionYr;
  var englishTest = req.body.englishTest;

  var newApplication = {
    userId: req.user.id,
    hQualification: hQualification,
    hGrade: hGrade,
    hSchoolName: hSchoolName,
    hCompleted: hCompleted,
    hProgrammeYear: hProgrammeYear,
    pQualification: pQualification,
    pGrade: pGrade,
    pSchoolName: pSchoolName,
    pCompleted: pCompleted,
    pProgrammeYear: pProgrammeYear,
    highSchoolName: highSchoolName,
    completionYr: completionYr,
    englishTest: englishTest,
  };

  if (applicationId) {
    newApplication.id = applicationId;

    Application.update(newApplication, applicationId).then((application) => {});
  } else {
    Application.create(newApplication).then((data) => {});
  }
  res.redirect("/application/step4");
});

router.post("/mobileForm3", async function (req, res, next) {
  let userId = req.body.userId;
  let getApplication = await Query.Application.findByUser(userId);
  try {
    var dataObject;
    var applicationId = req.body.id;
    let isError = false;
    var hQualification = req.body.hQualification;
    var hGrade = req.body.hGrade;
    var hSchoolName = req.body.hSchoolName;
    var hCompleted = req.body.hCompleted;
    var hProgrammeYear = req.body.hProgrammeYear;
    var pQualification = req.body.pQualification;
    var pGrade = req.body.pGrade;
    var pSchoolName = req.body.pSchoolName;
    var pCompleted = req.body.pCompleted;
    var pProgrammeYear = req.body.pProgrammeYear;
    var highSchoolName = req.body.highSchoolName;
    var completionYr = req.body.completionYr;
    var englishTest = req.body.englishTest;

    var newApplication = {
      userId: userId,
      hQualification: hQualification,
      hGrade: hGrade,
      hSchoolName: hSchoolName,
      hCompleted: hCompleted,
      hProgrammeYear: hProgrammeYear,
      pQualification: pQualification,
      pGrade: pGrade,
      pSchoolName: pSchoolName,
      pCompleted: pCompleted,
      pProgrammeYear: pProgrammeYear,
      highSchoolName: highSchoolName,
      completionYr: completionYr,
      englishTest: englishTest,
    };

    if (applicationId) {
      newApplication.id = applicationId;

      dataObject = await Application.update(newApplication, applicationId);
    } else {
      dataObject = Application.create(newApplication);
    }

    return res.send({
      error: isError,
      message: apiMsg(isError),
      app: getApplication,
    });
  } catch (err) {
    return res.send({
      error: true,
      message: apiMsg(true),
      app: getApplication,
    });
  }
});

router.post("/form4", ensureAuthenticated, function (req, res, next) {
  var applicationId = req.body.id;
  const course1 = req.body.course1;
  const course2 = req.body.course2;
  const schoolWish1 = req.body.schoolWish1;
  const schoolWish2 = req.body.schoolWish2;
  const city = req.body.cityOfChoice;
  const level = req.body.level;

  var sponsor = req.body.sponsor;
  var sponsorName = req.body.sponsorName;
  var sponsorOccupation = req.body.sponsorOccupation;
  var budget = req.body.budget;

  var newApplication = {
    userId: req.user.id,
    cityId: city,
    course1: course1,
    course2: course2,
    schoolWish1: schoolWish1,
    schoolWish2: schoolWish2,
    level: level,
    sponsor: sponsor,
    sponsorName: sponsorName,
    sponsorOccupation: sponsorOccupation,
    budget: budget,
  };

  if (applicationId) {
    newApplication.id = applicationId;
    Application.update(newApplication, applicationId).then((image) => {});
  } else {
    Application.create(newApplication).then((data) => {});
  }

  res.redirect("/application/step5");
});

router.post("/mobileForm4", async function (req, res, next) {
  let userId = req.body.userId;
  let getApplication = await Query.Application.findByUser(userId);
  try {
    var dataObject;
    var applicationId = req.body.id;

    var sponsor = req.body.sponsor;
    var sponsorName = req.body.sponsorName;
    var sponsorOccupation = req.body.sponsorOccupation;
    var budget = req.body.budget;
    let isError = false;

    var newApplication = {
      userId: userId,
      sponsor: sponsor,
      sponsorName: sponsorName,
      sponsorOccupation: sponsorOccupation,
      budget: budget,
    };

    if (applicationId) {
      newApplication.id = applicationId;
      dataObject = await Application.update(newApplication, applicationId);
    } else {
      dataObject = await Application.create(newApplication);
    }

    return res.send({
      error: isError,
      message: apiMsg(isError),
      app: getApplication,
    });
  } catch (err) {
    return res.send({
      error: true,
      message: apiMsg(true),
      app: getApplication,
    });
  }
});
router.post("/mobileForm6", config.cpUpload2, async function (req, res, next) {
  let userId = req.body.userId;
  let getApplication = await Query.Application.findByUser(userId);
  try {
    var dataObject;
    let isError = false;
    let applicationId = req.body.id;

    let img =
      req.files["credential"] === undefined
        ? ""
        : req.files["credential"][0].filename;
    let newApplication = {
      userId: userId,
      credential: img,
    };
    if (applicationId) {
      newApplication.id = applicationId;
      dataObject = await Application.update(newApplication, applicationId);
    } else {
      dataObject = await Application.create(newApplication);
    }

    return res.send({
      error: isError,
      message: apiMsg(isError),
      app: getApplication,
    });
  } catch (err) {
    return res.send({
      error: true,
      message: apiMsg(true),
      app: getApplication,
    });
  }
});

router.post("/mobileSubmission", async function (req, res, next) {
  let userId = req.body.userId;
  

  try {
    var dataObject;
    let isError = false;
    let applicationId = req.body.id;

    let newApplication = {
      userId: userId,
      id: applicationId,
      hasSubmitted: true,
      decision: "Pending",
    };

    if (applicationId) {
      newApplication.id = applicationId;
      dataObject = await Application.update(newApplication, applicationId);
      mail.send(
        getApplication.contactEmail,
        mail.applicationSubject(),
        mail.messageForAppSubmission(getApplication.firstname)
      );
    } else {
      isError = true;
    }
    let getApplication = await Query.Application.findByUser(userId);
    return res.send({
      error: isError,
      message: apiMsg(isError),
      app: getApplication,
    });
  } catch (err) {
    let getApplication = await Query.Application.findByUser(userId);
    return res.send({
      error: true,
      message: apiMsg(true),
      app: getApplication,
    });
  }
});

router.post("/form5", config.cpUpload2, ensureAuthenticated, function (
  req,
  res,
  next
) {
  let applicationId = req.body.id;
  let hasApplied = req.body.hasApplied;
  let purpose = req.body.purpose;
  let reasonOfRefusal = req.body.reasonOfRefusal;
  let moreInfo = req.body.moreInfo;
  let img =
    req.files["credential"] === undefined
      ? ""
      : req.files["credential"][0].filename;

  let newApplication = {
    userId: req.user.id,
    hasApplied: hasApplied,
    purpose: purpose,
    reasonOfRefusal: reasonOfRefusal,
    credential: img,
    moreInfo: moreInfo,
  };

  if (applicationId) {
    newApplication.id = applicationId;

    Application.update(newApplication, applicationId).then();
  } else {
    Application.create(newApplication).then();
  }

  res.redirect("/application/finish");
});

router.post("/mobileForm5", async function (req, res) {
  let userId = req.body.userId;
  let getApplication = await Query.Application.findByUser(userId);
  try {
    var dataObject;
    let applicationId = req.body.id;
    let hasApplied = req.body.hasApplied;
    let purpose = req.body.purpose;
    let reasonOfRefusal = req.body.reasonOfRefusal;
    let isError = false;
    let moreInfo = req.body.moreInfo;

    var courseId = req.body.courseId;
    var getCourseById = await Query.Course.findById(courseId);
    var course1 = getCourseById.name;
    var course2 = getCourseById.name;
    var level = getCourseById.DegreeType.name;
    var cityOfChoice = getCourseById.Institution.CityId;
    var schoolWish1 = getCourseById.Institution.name;
    var schoolWish2 = getCourseById.Institution.name;

    let newApplication = {
      userId: userId,
      hasApplied: hasApplied,
      purpose: purpose,
      reasonOfRefusal: reasonOfRefusal,
      moreInfo: moreInfo,
      course2: course2,
      course1: course1,
      level: level,
      cityId: cityOfChoice,
      schoolWish1: schoolWish1,
      schoolWish2: schoolWish2,
      courseId: courseId,
      //hasSubmitted: true,
      //decision: "Pending"
    };

    if (applicationId) {
      newApplication.id = applicationId;

      dataObject = await Application.update(newApplication, applicationId);
    } else {
      dataObject = await Application.create(newApplication);
    }

    return res.send({
      error: isError,
      message: apiMsg(isError),
      app: getApplication,
    });
  } catch (err) {
    return res.send({
      error: true,
      message: apiMsg(true),
      app: getApplication,
    });
  }
});

module.exports = router;
