const session = require("express-session");

function verifySession(req, res, next) {
    if (req.session && req.session.user) {
        console.log(`${req.session} &&  ${ req.session.user}`);
        
      next();
    } else {
      res.redirect("/login");
    }
  }
  
  module.exports = { verifySession };