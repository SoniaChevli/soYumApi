const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const users = require("./routes/users");
const photos = require("./routes/photos");
const auth = require("./routes/auth");
const allowCrossDomain = require("./middleware/allowCrossDomain");
const app = express();
const config = require("config");

if (!config.get("jwtPrivateKey")) {
  console.error("FATAL ERROR: jwtPrivateKey is not defined");
  process.exit(1);
}
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("Connected to soYum DB..."))
    .catch(err =>
      console.log("There was an error connecting to the soYum DB....", err)
    );
} else {
  mongoose
    .connect("mongodb://localhost/soYum")
    .then(() => console.log("Connected to soYum DB..."))
    .catch(err =>
      console.log("There was an error connecting to the soYum DB....", err)
    );
}

app.use(express.json()); //if there is json in the req it will populate req.body
app.use(express.urlencoded({ extended: true })); //parses a key=value format and will populate req.body
app.use(express.static("public")); //this allows us to serve static content (folder is called public)
app.use(allowCrossDomain);
app.use(helmet());
app.use("/api/users", users);
app.use("/api/auth", auth);
app.use("/api/photos", photos);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Listening on port ${port}`));
