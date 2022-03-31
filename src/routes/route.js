const express = require('express');
const router = express.Router();

const userController = require("../controllers/userController")
const bookController = require("../controllers/bookController")
const reviewController = require("../controllers/reviewController")
const middleWare = require("../middleWare/auth")




router.post("/register", userController.createUser)
router.post("/login",userController.createLogin)



router.post("/books", middleWare.auth ,bookController.createBook)
router.get("/books",middleWare.auth,bookController.getBooks)
router.get("/books/:bookId",middleWare.auth,bookController.getBookdetails)
router.put("/books/:bookId",middleWare.auth,bookController.updateBookDetails)
router.delete("/books/:bookId",middleWare.auth,bookController.deleteBook)






router.post("/books/:bookId/review",reviewController.createReview)
router.put("/books/:bookId/review/:reviewId",reviewController.updateReview)
router.delete("/books/:bookId/review/:reviewId",reviewController.deleteReview)


module.exports = router;