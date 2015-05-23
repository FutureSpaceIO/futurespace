export default (sequelize, DataTypes) => {
  const post = sequelize.define('post', {
    title: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return post;
};