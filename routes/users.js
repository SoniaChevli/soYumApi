const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { User, validateUser } = require("../models/user");
const { Photo } = require("../models/photo");
const auth = require("../middleware/auth");

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

router.put("/me", auth, async (req, res) => {
  console.log("req ", req.body);
});

router.get("/", async (req, res) => {
  const user = await User.find();
  res.send(user);
});

router.post("/", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  user = new User({
    userName: req.body.userName,
    email: req.body.email,
    bio: req.body.bio,
    password: req.body.password,
    profilePhoto: req.body.profilePhoto
  });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();
  const token = user.generateAuthToken();

  res.header("x-auth-token", token).send({
    userName: user.userName,
    email: user.email
  });
});

module.exports = router;
