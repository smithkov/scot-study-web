var express = require('express');
var router = express.Router();
var multer = require('multer');
var Qualification = Query = require('../queries/query').Qualification;
const config = require("../my_modules/config");
const isAdmin = config.isAdmin;
const ensureAuthenticated = config.ensureAuthenticated;

const url = require('url');
const entityName = "qualification"

router.get('/add', ensureAuthenticated,isAdmin, function(req, res, next) {
    if(req.user.roleId){
        res.render('add',{layout: 'layoutDashboard.handlebars',user: req.user,entity:entityName});
    }
    else{
      res.redirect("/login");
    }
});

router.get('/listing', function(req, res, next) {
  if(req.user.roleId){
    Qualification.findAll().then(data=>{
       res.render('list',{layout: 'layoutDashboard.handlebars',data:data,user:req.user,entity:entityName});
    })
  }
  else{
    res.redirect("/login");
  }
});

router.get('/update/:_id', function(req, res, next) {
  Qualification.findById(req.params._id).then(data=>{
      res.render('update',{layout: 'layoutDashboard.handlebars',data:data,user:req.user,entity:entityName});
    });
});

router.get('/delete/:_id',ensureAuthenticated, function(req, res, next) {
  let id = req.params._id;
  Qualification.delete(id).then(data=>{
      res.redirect('/listing');
    });
});

router.post('/update',ensureAuthenticated,isAdmin,function(req,res){

  var name = req.body.name;
  var id = req.body.id;
//  console.log("id: "+ id);

  Qualification.update({name:name,id:id},id).then(image=>{

    req.flash('success_msg',name+ ' have been modified successfully');
    res.redirect("/listing");
  })
});

router.post('/add',ensureAuthenticated, isAdmin, function(req, res, next) {
  if(req.user.roleId){
    var name = req.body.name;
    //req.checkBody('name', 'Name is required').notEmpty();
  	var newQualification = {
      name: name
    };

    Qualification.create(newQualification).then(data=> {
      if (err) throw err;
      req.flash('success_msg', 'You have successfully added a new Degree Type');
      res.redirect("/listing");
    });
  }
  else{
    res.redirect("/login")
  }


});

module.exports = router;
