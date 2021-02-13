const Sequelize = require('sequelize');
module.exports = class Love extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      user:{
        type: Sequelize.STRING(40),
        allowNull:false,
      },
      like:{
        type: Sequelize.INTEGER,
        allowNull:false,
        defaultValue:0,
      }
    },{
      sequelize,
      timestamps: false,
      underscored: false,
      modelName: 'Love',
      tableName: 'Love',
      paranoid: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    });
  }
}