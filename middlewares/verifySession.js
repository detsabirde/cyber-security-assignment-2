const session = require("express-session");

function verifySession(req, res, next) {
  if (req.session && req.session.user) {
    console.log("Session exists for user:", req.session);
    next();
  } else {
    res.redirect("/login");
  }
}

const redirectIfAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return res.redirect("/my-account");
  }
  next();
};

module.exports = { verifySession, redirectIfAuthenticated };