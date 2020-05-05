//this is an exercise to attempt registering and logging in users with
//a jwt encrypted password.
//at login, the password needs to be encrypted with a key. the hash is stored locally
//the private key needs to be set as an environment variable so it can't be seen in your source code
// we use bcrypt for hashing and checking
//load the application at host/register

// when the user logs in or registers the jwt token is set as a cookie in their browser
// for any operation that would require authentication, (ie editUser in this case),  the call is
// passed to the authentication.js middleware module to check the token
// the browser passes the cookie automatically.

// to test this, clear the browser of cookies and try to send a new password request
// it should send a 401 error

const mongoose = require("mongoose");
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(express.json());
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
app.use(express.static(__dirname));
const auth = require("./authentication");
//app.use(auth);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});
app.get("/register", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});

const users = [
  { id: 1, name: "scary", password: "" },
  { id: 2, name: "funny", password: "" },
  { id: 3, name: "serious", password: "" },
  { id: 4, name: "musical", password: "" },
];

app.get("/register", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/api/users", (req, res) => {
  res.send(users);
});

app.get("/api/users/:id", (req, res) => {
  const user = users.find((g) => g.id === parseInt(req.params.id));
  if (!user) return res.status(404).send("user was not found");
  res.send(user);
});

app.post("/api/login", async (req, res) => {
  //,auth as middleware
  const user = users.find((u) => u.name === req.body.name);
  console.log("login user", user);
  if (!user) {
    return res.status(404).send("user was not found");
  }
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  console.log("valid password", validPassword, req.body.password);

  if (validPassword) {
    let jwtPrivateKey = "12345";
    const token = jwt.sign(user, jwtPrivateKey);

    res
      .cookie("x-auth-token", token)
      .header("x-auth-token", token)
      .send("welcome" + user.name);
  } else {
    return res.status(401).send("wrong Password");
  }
});

app.post("/api/register", async (req, res) => {
  // do the registration here
  console.log(users);
  let jwtPrivateKey = "12345";
  const user = {
    id: users.length + 1,
    name: req.body.name,
    password: req.body.password,
  };

  console.log(user.password);

  const salt = await bcrypt.genSalt(10); //the higher the number the longer it takes and the more comples the string

  user.password = await bcrypt.hash(user.password, salt);
  console.log(user.password);
  users.push(user);
  console.log("logging users in register", users);
  const token = jwt.sign(user, jwtPrivateKey);

  let sendUser = Object.create(user);
  delete sendUser["password"];

  res
    .cookie("x-auth-token", token)
    .header("x-auth-token", token)
    .header("Content-Type", "application/json")
    .send(user);
});

app.put("/api/editUser/:id", auth, async (req, res) => {
  // to test auth middleware functionality
  const user = users.find((u) => u.id === parseInt(req.params.id));
  console.log("request id", req.params.id);
  if (!user) return res.status(404).send("user not found");
  const salt = await bcrypt.genSalt(10); //the higher the number the longer it takes and the more comples the string
  console.log("editUsers users before", users);
  console.log(req.body);
  user.password = await bcrypt.hash(req.body.newpassword, salt);
  console.log("editUser users after", users);
  console.log(
    "changePassword",
    users,
    "userid: ",
    user.id,
    "++++++++++++++",
    salt
  );
  res.send(user);
});

app.delete("/api/users/:id", (req, res) => {
  const user = users.find((g) => g.id === parseInt(req.params.id));
  if (!user) res.status(404).send("course was not found");
  index = users.indexOf(user);
  users.splice(parseInt(index, 1));
  res.send(users);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port ${port}`));

exports.users = users;
