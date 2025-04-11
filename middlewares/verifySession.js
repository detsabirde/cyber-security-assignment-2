const session = require("express-session");

function verifySession(req, res, next) {
  if (req.session.user) {
    console.log("Session exists for user:", req.session.user);
    next();
  } else {
    res.redirect("/login");
  }
}

module.exports = { verifySession };
  module.exports = { verifySession };