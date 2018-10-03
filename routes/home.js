const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index", {
    title: "SoYum",
    message: "Welcome to Sonia's EOY project"
  });
});

module.exports = router;
