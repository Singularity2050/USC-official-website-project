require('dotenv').config();

module.exports = {
  
    development: {
    username: "sunykorea",
    password: "soonwechat36",
    database: "usc",
    host: "database-1.csicbi1sqrpx.ap-northeast-2.rds.amazonaws.com",
    dialect: "mysql"
    },
    production: {
    username: "root",
    password: "Soonwe2020!",
    database: "usc",
    host: "127.0.0.1",
    dialect: "mysql"
    },
};
