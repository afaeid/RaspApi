const Movie = require("./../models/movieModel");
const ApiFeatures = require("./../Utils/apiFeatures")
const asyncErrorHandler = require("./../Utils/asyncErrorHandler");
const customErrorHandler = require("./../Utils/customError")
// Just added for personal use

exports.countMovies = async (req, res, next) => {
 req.moviesCount = await Movie.countDocuments()

 next()
}

exports.getHighestRated = (req, res, next) => {

 req.query.sort = "-ratings"
 req.query.limit = "5";

 next()
}

exports.getAllMovies = asyncErrorHandler(async (req, res) => {


 const features = new ApiFeatures(Movie.find(), req.query, req).filter().projection().sort().paginate()

 const movies = await features.query

 // let queryStr = JSON.stringify(req.query)
 // queryStr = queryStr.replace(/\b(lt|lte|gt|gte)\b/g, (match) => `$${match}`)
 // const queryObj = JSON.parse(queryStr)
 // let query = Movie.find(queryObj);

 //query = query.sort(req.query.sort ? req.query.sort.split(",").join(" ") : "-createdAt")

 //query = query.select(req.query.fields ? req.query.fields.split(",").join(" ") : "-__v")

 // const page = req.query.page * 1 || 1;
 // const limit = req.query.limit * 1 || 25
 // const skip = (page - 1) * limit
 // query = query.skip(skip).limit(limit)

 // if (req.query.page) {
 //  const moviesCount = await Movie.countDocuments()
 //  if (skip >= moviesCount) {
 //   throw new Error("This page is not found")
 //  }
 // }


 // const movies = await Movie.find()
 //                .where("duration")
 //                .gte(req.params.duration)
 //                .where("ratings")
 //                .gte(req.params.ratings)
 //                .where("price")
 //                .lte(req.params.price)

 res
  .status(201)
  .json({
   status: "success",
   length: movies.length,
   data: {
    movies
   }
  })


})

exports.getMovie = asyncErrorHandler(async (req, res, next) => {

 const movie = await Movie.findById(req.params.id);

 if (!movie) {
  const err = new customErrorHandler(`Movie is not found with the id ${req.params.id}`, 404)
  return next(err)
 }

 res
  .status(201)
  .json({
   status: "success",
   data: {
    movie
   }
  })

})


exports.postMovie = asyncErrorHandler(async (req, res) => {

 const movie = await Movie.create(req.body)

 res
  .status(201)
  .json({
   status: "success",
   data: {
    movie
   }
  })

})

exports.updateMovie = asyncErrorHandler(async (req, res, next) => {

 const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

 if (!updatedMovie) {
  const err = new customErrorHandler(`Movie is not found with the id ${req.params.id}`, 404)
  return next(err)
 }

 res
  .status(200)
  .json({
   status: "success",
   data: {
    updatedMovie
   }
  })

})

exports.deleteMovie = asyncErrorHandler(async (req, res, next) => {

 const deletedMovie = await Movie.findByIdAndDelete(req.params.id);

 if (!deletedMovie) {
  const err = new customErrorHandler(`Movie is not found with the id ${req.params.id}`, 404)
  return next(err)
 }

 res
  .status(200)
  .json({
   status: "success",
   message: `The movie with the Id ${req.params.id} named ${deletedMovie.name} has been deleted` 
  })

})

exports.getMovieStats = asyncErrorHandler(async (req, res) => {

 const stats = await Movie.aggregate([
  { $match: { ratings: { $gte: 5.8 } } },
  {
   $group: {
    _id: "$releaseYear",
    avgRating: { $avg: "$ratings" },
    avgPrice: { $avg: "$price" },
    minPrice: { $min: "$price" },
    maxPrice: { $max: "$price" },
    totalPrice: { $sum: "$price" },
    movieCount: { $sum: 1 },
   }
     },
  { $addFields: { releaseYear: "$_id" } },
  { $project: { _id: 0 } },
  { $sort: { minPrice: 1 } },
     // { $match: { maxPrice: { $gte: 60 } } },
    ])

 // just for personal use
 /*const stats = await Movie.aggregate([
   { $unwind: "$genres" },
   {
    $group: {
     _id: null,
     genres: { $addToSet: "$genres" }
    }
   },
   {
    $addFields: { totalGenres: { $size: "$genres" } }
   }
 ])*/


 res
  .status(200)
  .json({
   status: "success",
   count: stats.length,
   data: {
    stats
   }
  })

})



exports.getMoviesByGenre = asyncErrorHandler(async (req, res, next) => {

 const genre = req.params.genre
 const movies = await Movie.aggregate([
  { $unwind: "$genres" },
  {
   $group: {
    _id: "$genres",
    movieCount: { $sum: 1 },
    movies: { $push: "$name" }
   }
   },
  { $addFields: { genre: "$_id" } },
  { $project: { _id: 0 } },
  { $sort: { movieCount: -1 } },
  { $match: { genre: genre } }
   ])
   
 // if (movies.length == 0) {
 //  const err = new customErrorHandler(`Movie is not found with the genre ${req.params.genre}`, 404)
 //  return next(err)
 // }

 res
  .status(200)
  .json({
   status: "success",
   data: {
    movies
   }
  })

})
