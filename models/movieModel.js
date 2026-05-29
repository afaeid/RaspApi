const mongoose = require("mongoose")
const fs = require("fs")
const validator = require("validator")

const movieSchema = mongoose.Schema({
 name: {
  type: String,
  required: [true, "Name field is required"],
  minLength: [4, "Movie name must have at least 4 characters."],
  maxLength: [100, "Movie name cannot me more than 100 characters."],
  unique: true,
  trim: true,
  /* validate: [validator.isAlpha, "Only alpha characters are mot supported"]*/
 },
 duration: {
  type: Number,
  required: [true, "Duration filed is required."]
 },
 description: {
  type: String,
  required: [true, "Description filed is required."],
  trim: true
 },
 ratings: {
  type: Number,
  /*validate:{ 
   validator: function (value) {
   return value >= 1 && value <= 10
  },
  message: "ratings is not available"
  }*/
  min: [1, "Ratings must have to be equal or more than 1."],
  max: [10, "Ratings must have to be equal or less than 10."]
 },
 totalRatings: {
  type: Number
 },
 releaseYear: {
  type: Number,
  required: [true, "Release year filed is required!!!"]
 },
 releaseDate: {
  type: Date
 },
 createdAt: {
  type: Date,
  default: Date.now()
 },
 genres: {
  type: [String],
  required: [true, "Genres field is required."],
  enum: {
   values: ["Fantasy",
          "Action",
          "Sci-Fi",
          "Crime",
          "Thriller",
          "Biography",
          "History",
          "Adventure",
          "War",
          "Mystery",
          "Romance",
          "Animation",
          "Comedy",
          "Drama"],
   message: "This genre is not available."
  }
 },
 directors: {
  type: [String],
  required: [true, "Directors filed is required."]
 },
 actors: {
  type: [String],
  required: [true, "Actress field is required."]
 },
 price: {
  type: Number,
  required: [true, "Price field is required."]
 },
 createdBy: String
}, {
 toJSON: { virtuals: true },
 toObject: { virtuals: true }
});

movieSchema.virtual("durationInHour").get(function() {
 return this.duration / 60;
})

movieSchema.pre("save", function(next) {
 this.createdBy = "Afaeid";
 next()
})

movieSchema.post("save", (doc, next) => {
 const content = `A new movie is created with the name ${doc.name} by ${doc.createdBy} \n`
 if (process.env.NODE_ENV === "development") {
    fs.writeFileSync('./Log/log.txt');
  }
 next()
})


movieSchema.pre(/^find/, function(next) {
 this.find({ releaseDate: { $lte: Date.now() } })
 this.startTime = Date.now()
 next()
})

movieSchema.post(/^find/, function(docs, next) {
 this.endTime = Date.now()

 const content = `Query took ${this.endTime - this.startTime} milliseconds to fetch the docs.\n`
 if (process.env.NODE_ENV === "development") {
    fs.writeFileSync('./Log/log.txt');
  }
 next()
})

movieSchema.pre("aggregate", function(next) {
 this.pipeline().unshift({ $match: { releaseDate: { $lte: new Date() } } })
 next()
})


const Movie = mongoose.model("Movie", movieSchema);

module.exports = Movie;
