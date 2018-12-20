const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const _ = require("lodash");
const { Photo, validatePhoto } = require("../models/photo");
var cloudinary = require("cloudinary").v2;

const auth = require("../middleware/auth");

router.get("/", async (req, res) => {
  let searchTags = req.query.tags;
  let searchCity = req.query.city;

  if (searchTags && searchCity) {
    let photos = await Photo.find({
      tags: { $all: searchTags }
    }).sort({ created_at: -1 });
    photos = await photos.filter(
      c => c.city.toLowerCase() === searchCity.toLowerCase()
    );
    res.send(photos);
  } else if (searchTags) {
    const photos = await Photo.find({
      tags: { $all: searchTags }
    });
    res.send(photos);
  } else if (searchCity) {
    searchCity = new RegExp(searchCity, "i");
    const photos = await Photo.find({ city: searchCity }).sort({
      created_at: -1
    });
    res.send(photos);
  } else {
    const photos = await Photo.find().sort({ created_at: -1 });
    res.send(photos);
  }
});

router.get("/:id", async (req, res) => {
  const photo = await Photo.findById(req.params.id);
  if (!photo)
    return res.status(404).send("The photo with the given id was not found");
  res.send(photo);
});

router.put("/favorite/:id", auth, async (req, res) => {
  Photo.findOne({ _id: req.body.photoId }, function(err, selectedPhoto) {
    if (err) {
      return res.send(err);
    }

    if (selectedPhoto) {
      let isInArray = selectedPhoto.favorites.some(function(userId, index) {
        return String(userId) === String(req.body.currentUserId);
      });
      if (isInArray) {
        selectedPhoto.favorites.some(function(userId, index) {
          if (String(userId) === String(req.body.currentUserId))
            selectedPhoto.favorites.splice(index, 1);
        });
      } else {
        selectedPhoto.favorites.push(
          mongoose.Types.ObjectId(req.body.currentUserId)
        );
      }
      selectedPhoto.save(function(err) {
        if (err) {
          return res.send(err);
        }

        res.send({ message: "done" });
      });
    }
  });
});

router.get("/favorites/user/:id", auth, async (req, res) => {
  const photos = await Photo.find({
    favorites: { $in: mongoose.Types.ObjectId(req.params.id) }
  }).sort({ created_at: -1 });
  if (!photos)
    return res.status(404).send("The user with the given id was not found");
  res.send(photos);
});

router.get("/user/:id", async (req, res) => {
  const photos = await Photo.find({
    "author._id": req.params.id
  }).sort({ created_at: -1 });
  if (!photos)
    return res.status(404).send("The user with the given id was not found");
  res.send(photos);
});

router.post("/", auth, async (req, res) => {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
  });
  await cloudinary.uploader.upload(
    req.body.photo,
    { resource_type: "auto" },
    function(err, image) {
      if (err) {
        console.warn(err);
      } else req.body.photo = image.url;
    }
  );

  const { error } = validatePhoto(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let photo = new Photo({
    restaurantName: req.body.restaurantName,
    restaurantLink: req.body.restaurantLink,
    photo: req.body.photo,
    author: { _id: req.user._id, userName: req.user.userName },
    city: req.body.city,
    description: req.body.description,
    tags: req.body.tags,
    favorites: []
  });

  await photo.save();

  res.send(photo);
});

router.delete("/:id", auth, async (req, res) => {
  let photo = await Photo.findById(req.params.id);
  if (!photo)
    return res.status(404).send("The photo with the given id was not found");
  try {
    photo = await Photo.remove({ _id: req.params.id });
    res.send(photo);
  } catch (err) {
    console.log("ERROR", err);
  }
});
module.exports = router;
