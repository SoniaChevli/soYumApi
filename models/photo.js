const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");

const photoSchema = new mongoose.Schema({
  restaurantName: {
    type: String,
    required: [true, "can't be blank"],
    minlength: 1,
    maxlength: 50
  },
  restaurantLink: {
    type: String,
    minlength: 1,
    maxlength: 200
  },
  author: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    userName: { type: String }
  },
  city: {
    type: String,
    required: [true, "can't be blank"],
    minlength: 2,
    maxlength: 100
  },
  description: String,
  photo: {
    type: String
  },
  tags: [],
  created_at: {
    type: Date,
    default: Date.now
  },
  favorites: []
});

function validatePhoto(photo) {
  const schema = {
    restaurantName: Joi.string()
      .min(1)
      .max(50)
      .required(),
    restaurantLink: Joi.string()
    .max(50),
    author: Joi.object(),
    city: Joi.string().required(),
    description: Joi.string(),
    tags: Joi.array(),
    photo: Joi.string().required()
  };

  return Joi.validate(photo, schema);
}

const Photo = mongoose.model("Photo", photoSchema);

exports.photoSchema = photoSchema;
exports.Photo = Photo;
exports.validatePhoto = validatePhoto;
