const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const shortid = require("shortid");
require("dotenv").config();

let users = [];

const findUserFromId = (id) => {
  return users.find((user) => user._id === id);
};
const findUserFromUsername = (username) => {
  return users.find((user) => user.username === username);
};

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", (req, res) => {
  const username = req.body.username;
  const user = findUserFromUsername(username);
  if (user) {
    //checkusernameExist
    res.json({ username: user.username, _id: user._id });
    return;
  }
  const _id = shortid.generate(); // Generate a unique _id
  const new_user = { _id: _id, username: username, exercises: [] };
  users.push(new_user);
  res.json({ username: username, _id: _id });
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const _id = req.params._id; // Extract user ID from route parameters
  const user = findUserFromId(_id);

  if (!user) {
    res.json({ error: "User not found" });
    return;
  }

  const date = req.body.date ? new Date(req.body.date) : new Date();
  const duration = parseInt(req.body.duration);
  const description = req.body.description;

  const exercise = {
    date: date,
    duration: duration,
    description: description,
  };

  user.exercises.push(exercise);

  // Respond with the updated user object
  res.json({
    _id: user._id, // Assuming user object has an _id property
    username: user.username,
    date: date.toDateString(),
    duration: duration,
    description: description,
  });
});

app.get("/api/users/", (req, res) => {
  const user_list = users.map((user) => {
    return { username: user.username, _id: user._id };
  });
  res.json(user_list);
});

app.get("/api/users/:_id/logs/", (req, res) => {
  const _id = req.params._id;
  const user = findUserFromId(_id);
  if (!user) {
    res.json({ error: "User not found" });
    return;
  }
  const from = req.query.from ? new Date(req.query.from) : new Date(0);
  const to = req.query.to ? new Date(req.query.to) : new Date();
  let filtered_exercises = user.exercises
      .filter((exercise) => exercise.date >= from && exercise.date <= to);
  const limit = req.query.limit ? parseInt(req.query.limit) : filtered_exercises.length; 
  const logs = filtered_exercises.slice(0, limit);
  const count = logs.length;
  const log = logs.map((exercise) => ({
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString(),
  }));
  res.json({ _id: _id, username: user.username, count: count, log: log });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
