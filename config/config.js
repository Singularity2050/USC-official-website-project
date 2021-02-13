require('dotenv').config();

module.exports = {
  
    development: {
      username: "root",
      password:process.env.SEQUELUZE_PASSWORD,
      database: "usc",
      host: "127.0.0.1",
      dialect: "mysql",
      
    },
    production: {
      username: "root",
      password: process.env.SEQUELUZE_PASSWORD,
      database: "usc",
      host: "127.0.0.1",
      dialect: "mysql",
      
      
    },
};
