const router = require('express').Router()
const authenticateToken = require('../middlewares/auth')

const {
    getAllMovies
    // createMovie,
    // getMovieById
  } = require('../controllers/movieController')

router.use(authenticateToken)
router.route('/').get(getAllMovies)
// .post(createMovie)
// router.route('/:id').get(getMovie).put(updateMovie).delete(deleteMovie)

module.exports = router