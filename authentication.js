//this file checks to see if the client has sent a valid token.
//for this example jwtPrivatekey is set t0 12345
//it checks to see if the token is in a cookie or if it is sent as a header

const jwt = require("jsonwebtoken");
const config = require("config");
const cookie = require("cookie");
const users = require("./index");
const bcrypt = require("bcrypt");

async function auth(req, res, next) {
  let token;

  var cookies = cookie.parse(req.headers.cookie || "");
  if (cookies["x-auth-token"]) {
    token = cookies["x-auth-token"];
  } else {
    token = req.header("x-auth-token");
  }
  if (!token) return res.status(401).send("access denied, no token provided");

  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    req.user = decoded; // this is the decoded payload,the one that gets encoded in user.generateAuthToken with a payload of user.id
    next(); //next passes control to the next middleware function
  } catch (ex) {
    res.status(400).send("Invalid token");
  }
}

module.exports = auth;
