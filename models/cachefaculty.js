'use strict';
module.exports = (sequelize, DataTypes) => {
  const cacheFaculty = sequelize.define('cacheFaculty', {
    name: DataTypes.STRING,
    oId: DataTypes.INTEGER
  }, {});
  cacheFaculty.associate = function(models) {
    // associations can be defined here
  };
  return cacheFaculty;
};