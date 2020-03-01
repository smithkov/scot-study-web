var express = require("express");
var router = express.Router();
var multer = require("multer");
const fs = require("fs");

var er = require("../config/error").error;
var Query = require("../queries/query");
const readXlsxFile = require("read-excel-file/node");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
var upload = multer({
  storage: storage
});
var config = require("../my_modules/config");
const entityName = {
  name: "Course",
  entity: "course",
  course: true,
  url: "/course/",
  form: config.institution
};

router.get("/add", ensureAuthenticated, async function (req, res, next) {
  //if(req.user.roleId){
  let institutions = await Query.Institution.findAll();
  let degreetype = await Query.DegreeType.findAll();
  let studyArea = await Query.CacheFaculty.findAll();
  res.render("add", {
    layout: "layoutDashboard.handlebars",
    user: req.user,
    entity: entityName,
    inst: institutions,
    degreeTypeData: degreetype,
    studyAreaData: studyArea
  });

});

function titleCase(str) {
  str = str.toLowerCase().split(" ");

  let final = [];

  for (let word of str) {
    final.push(word.charAt(0).toUpperCase() + word.slice(1));
  }

  return final.join(" ");
}
router.get("/readExcelAndSave", function (req, res, next) {
  //console.log(res.file);
  res.render("excelUpload", { layout: "layoutDashboard.handlebars" });
});

router.post("/saveExcel", upload.single("file"), (req, res) => {
  console.log(req.file);
  res.redirect("readExcelAndSave");
});

router.post("/convert", async (req, res) => {
  let rows = await readXlsxFile(
    fs.createReadStream("public/uploads/Excel.xlsx")
  );
  let courseArray = [];
  for (var i = 0; i < rows.length; i++) {
    let school = rows[i][0];
    let studyArea = rows[i][1];
    let name = rows[i][2];
    let city = rows[i][3];
    let requirement = rows[i][4];
    let fees = rows[i][5];
    let duration = rows[i][6];
    let intake = rows[i][7];
    let degree = rows[i][8];
    let popular = rows[i][9];
    let scholarshipAmount = rows[i][10];

    let getFacultyImage = await Query.FacultyImage.findByStudyArea(studyArea);
    let randId = Math.floor(Math.random() * getFacultyImage.length) + 1;

    let getCourseImage = getFacultyImage[randId - 1];

    let checkNameExist = await Query.Course.findNameByInstitutionId(
      school,
      name
    );
    if (getCourseImage !== undefined) {
      var newCourse = {
        name: name,
        requirement: requirement,
        fee: fees,
        path: getCourseImage.path,
        duration: duration,
        intake: intake,
        isPopular: popular == "Popular" ? 1 : 0,
        institutionId: school,
        studyAreaId: studyArea,
        degreeTypeId: degree,
        scholarshipAmount: scholarshipAmount
      };
      if (checkNameExist) {
        newCourse.id = checkNameExist.id;
        let update = await Query.Course.update(newCourse, checkNameExist.id);
      } else {
        let add = await Query.Course.create(newCourse);
      }
    } else {
      console.log(
        "------------ERROORRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR--------------"
      );
      console.log(`${i}    ${name} `);
      console.log(
        "------------ERROORRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR--------------"
      );
    }
  }
  console.log(courseArray);
  return res.send({
    data: rows,
    error: false
  });
});

router.get("/listing", ensureAuthenticated, function (req, res, next) {
  //  if(req.user.roleId){
  Query.Course.findAll().then(course => {
    res.render("list", {
      layout: "layoutDashboard.handlebars",
      user: req.user,
      data: course,
      entity: entityName
    });
  });
});

// router.get('/popularCourses',function(req, res, next) {
// //  if(req.user.roleId){
//     Course.getByPopularity(function(err,data){
//       if(err){
//         throw err;
//       }
//        res.render('list',{layout: 'layoutDashboard.handlebars',data:data,entity:entityName});
//     })
//   // }
//   // else{
//   //   res.redirect("/login");
//   // }
// });
router.get("/update/:_id", ensureAuthenticated, async function (req, res, next) {
  let id = req.params._id;
  if (!id) throw er.err(er.noId);
  let studyArea = await Query.CacheFaculty.findAll();
  let course = await Query.Course.findById(id);
  let institutions = await Query.Institution.findAll();
  let degreetype = await Query.DegreeType.findAll();

  res.render("update", {
    layout: "layoutDashboard.handlebars",
    user: req.user,
    data: course,
    entity: entityName,
    inst: institutions,
    degreeTypeData: degreetype,
    studyAreaData: studyArea
  });

});

router.get("/delete/:_id", function (req, res, next) {
  let id = req.params._id;

  if (!id) throw er.err(er.noId);

  Query.Course.delete(id).then(data => {
    res.redirect(entityName.url + "listing");
  });
});

router.get("/popular/:_id", function (req, res, next) {
  let id = req.params._id;
  if (!id) throw er.err(er.noId);

  Query.Course.findById(id).then(data => {
    data.isPopular = data.isPopular ? false : true;
    Query.Course.update({ isPopular: data.isPopular }, id).then(data => {
      res.redirect(entityName.url + "listing");
    });
  });
});
router.get("/courses", function (req, res) {
  Query.Course.findAll().then(courses => {
    res.status(200).send({ data: courses });
  });
});

router.post("/update", async function (req, res, next) {
  var name = req.body.name;
  var id = req.body.id;
  //var requirement = req.body.requirement;
  var fee = req.body.fee;
  var country = req.body.country;
  var duration = req.body.duration;
  let intake = req.body.intake;

  let isPopular = req.body.popular;
  //var time = req.body.time;
  let scholarshipAmount = req.body.scholarshipAmount;
  var institution = req.body.institution;
  var studyArea = req.body.studyArea;
  var degreeType = req.body.degreeType;

  console.log("--------------------"+ studyArea+"-------------------------------")


  let getFacultyImage = await Query.FacultyImage.findByStudyArea(studyArea);
  let randId = Math.floor(Math.random() * getFacultyImage.length) + 1;

  let getCourseImage = getFacultyImage[randId - 1];
  var newCourse = {
    intake: intake,
    isPopular: isPopular ? 1 : 0,
    name: name,
    //requirement: requirement,
    fee: fee,
    countryId: country,
    duration: duration,
    //time: time,
    scholarshipAmount: scholarshipAmount,
    institutionId: institution,
    studyAreaId: studyArea,
    path: getCourseImage.path + ".png",
    degreeTypeId: degreeType
  };
  //  console.log("id: "+ id);
  Query.Course.update(newCourse, id).then(course => {
    res.redirect(entityName.url + "listing");
  });
});

router.post("/add", async function (req, res, next) {
  var name = req.body.name;
  var id = req.body.id;
  //var requirement = req.body.requirement;
  var fee = req.body.fee;
  var country = req.body.country;
  var duration = req.body.duration;
  let intake = req.body.intake;

  let isPopular = req.body.popular;
  //var time = req.body.time;
  let scholarshipAmount = req.body.scholarshipAmount;
  var institution = req.body.institution;
  var studyArea = req.body.studyArea;
  var degreeType = req.body.degreeType;


  let getFacultyImage = await Query.FacultyImage.findByStudyArea(studyArea);
  let randId = Math.floor(Math.random() * getFacultyImage.length) + 1;

  let getCourseImage = getFacultyImage[randId - 1];
  console.log("--------------------- " + isPopular + "------------------------------------------------")
  if (getCourseImage !== undefined) {
    var newCourse = {
      intake: intake,
      isPopular: isPopular ? 1 : 0,
      name: name,
      //requirement: requirement,
      fee: fee,
      countryId: country,
      duration: duration,
      //time: time,
      scholarshipAmount: scholarshipAmount,
      institutionId: institution,
      studyAreaId: studyArea,
      path: getCourseImage.path + ".png",
      degreeTypeId: degreeType
    };
    Query.Course.create(newCourse).then(course => { });
  }
  req.flash("success_msg", "You have successfully added a new course");
  res.redirect(entityName.url + "listing");
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
