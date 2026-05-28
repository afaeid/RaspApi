const express = require("express");
const router = express.Router();
const moviesControllers = require("./../Controllers/moviesControllers");
const authControllers = require("./../Controllers/authControllers")
router.route("/highest-rated")
 .get(moviesControllers.getHighestRated, moviesControllers.getAllMovies)

router.route("/get-movies-by-genre/:genre")
 .get(moviesControllers.getMoviesByGenre)

router.route("/movie-stats")
 .get(moviesControllers.getMovieStats)

router.route("/")
 .get(authControllers.protect, moviesControllers.countMovies, moviesControllers.getAllMovies)
 .post(authControllers.protect, authControllers.restrict("admin"), moviesControllers.postMovie)

router.route("/:id")
 .get(authControllers.protect, moviesControllers.getMovie)
 .patch(authControllers.protect, authControllers.restrict("admin"), moviesControllers.updateMovie)
 .delete(authControllers.protect, authControllers.restrict("admin"), moviesControllers.deleteMovie)

module.exports = router;
