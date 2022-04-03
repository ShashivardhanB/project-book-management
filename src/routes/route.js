const express = require('express');
const router = express.Router();

// importing the controllers and middleWare
const userController = require("../controllers/userController")
const bookController = require("../controllers/bookController")
const reviewController = require("../controllers/reviewController")
const middleWare = require("../middleWare/auth")


// user API  ==> registeration &  login
router.post("/register", userController.createUser)
router.post("/login",userController.createLogin)

//book API  ==>  createBook, getBooksByQueryParams , getBookDetailsByParams,updateBookDetails &deleteBook
router.post("/books", middleWare.auth ,bookController.createBook)
router.get("/books",bookController.getBooks)
router.get("/books/:bookId",bookController.getBookDetails)
router.put("/books/:bookId",middleWare.auth,bookController.updateBookDetails)
router.delete("/books/:bookId",middleWare.auth,bookController.deleteBook)

// review API  ==> createReview, updateReviewByQueryPramas & deleteReview
router.post("/books/:bookId/review",reviewController.createReview)
router.put("/books/:bookId/review/:reviewId",reviewController.updateReview)
router.delete("/books/:bookId/review/:reviewId",reviewController.deleteReview)


module.exports = router;