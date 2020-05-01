'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    roleId: DataTypes.BOOLEAN,
    username: DataTypes.STRING,
    photo: DataTypes.STRING,
    resetPasswordToken: DataTypes.STRING,
    resetPasswordExpires: DataTypes.STRING,
    pushId: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING,
    createdAt: DataTypes.DATE
  }, {});
  User.associate = function (models) {
    User.hasMany(models.Mail);
    // associations can be defined here
    //  User.hasMany(models.Course);
  };
  return User;
};
