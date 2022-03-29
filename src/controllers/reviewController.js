const reviewModel = require('../models/reviewModel')
const bookModel = require('../models/bookModel')
const mongoose = require('mongoose')
const { updateMany } = require('../models/reviewModel')
// const validate = require('../middleWare/validate')


const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}
const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

const createReview = async function (req, res) {
    try {

        let requestBody = req.body
        let { rating, reviewedBy } = requestBody
        let bookId = req.params.bookId



        if (!isValid(bookId)) return res.status(400).send({ status: false, message: "please provide bookId in params" })


        if (!isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "please provide valid bookId" })


        if (!isValidRequestBody(requestBody)) return res.status(400).send({ status: false, message: "please provide input via body" })


        if (!isValid(rating)) return res.status(400).send({ status: false, message: "please provide rating" })

        if (requestBody.hasOwnProperty(reviewedBy) || requestBody.reviewedBy == null ) {


            requestBody["reviewedBy"] = "Gues"


        }


        let isBookIdExist = await bookModel.findById({ _id: bookId })

        if (!isBookIdExist) {
            return res.status(400).send({ status: false, message: "please provide correct bookId" })
        } else {
            requestBody["bookId"] = bookId
        }

        if (isBookIdExist.isDeleted === false) {
            requestBody["reviewedAt"] = new Date();

        } else {
            return res.status(400).send({ status: false, message: "book is already deleted" })
        }

        if (rating < 1 || rating > 5) return res.status(400).send({ status: false, message: "please provide rating in between 1 to 5" })



        let reviewData = await reviewModel.create(requestBody)

        if (reviewData) {
            await bookModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: 1 } })

        }


        res.status(201).send({
            status: true, data: {
                "_id": reviewData._id,
                "bookId": reviewData.bookId,
                "reviewedBy": reviewData.reviewedBy,
                "reviewedAt": reviewData.reviewedAt,
                "rating": reviewData.rating,
                "review": reviewData.review
            }
        })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

// ------------------------------------------------------------------------------------------------------------------------------


// PUT /books/:bookId/review/:reviewId
// Update the review - , revireview, ratingewer's name.
// Check if the bookId exists and is not deleted before updating the review. Check if the review exist before updating the review. Send an error response with appropirate status code like this if the book does not exist
// Get review details like review, rating, reviewer's name in request body.
// Return the updated book document with reviews data on successful operation. The response body should be in the form of JSON object like this


const updateReview = async function (req, res) {
    try {
        let requestBody = req.body
        const { review, rating, reviewedBy } = requestBody
        let requestParams = req.params
        const { bookId, reviewId } = requestParams

        const finalFilter = {}


        if (!isValid(bookId)) {
            return res.status(400).send({
                status: false,
                message: "please provide bookId in params"
            })
        }
        if (!isValid(reviewId)) {
            return res.status(400).send({
                status: false,
                message: "please provide reviewId in params"
            })
        }


        if (!isValidObjectId(bookId)) {
            return res.status(400).send({
                status: false,
                message: "please provide valid bookId"
            })
        }
        if (!isValidObjectId(reviewId)) {
            return res.status(400).send({
                status: false,
                message: "please provide valid reviewId"
            })
        }
        if (isValid(review)) {
            finalFilter["review"] = review

        }
        if (isValid(rating)) {
            finalFilter["rating"] = rating
        }

        if (isValid(reviewedBy)) {
            finalFilter["reviewedBy"] = reviewedBy
        }

        let isReviewIdExist = await reviewModel.findOne({ $and: [{ _id: reviewId }, { isDeleted: false }] })
        if (isReviewIdExist) {
            if (isReviewIdExist.bookId == bookId) {
                let isBookIdExist = await bookModel.findOne({ $and: [{ _id: bookId }, { isDeleted: false }] })
                if (!isBookIdExist) {
                    return res.status(400).send({ status: false, message: "please provide correct bookId" })
                }
            } else {
                return res.status(400).send({ status: false, message: "please provide correct reviewId and bookId that is related" })
            }
        } else {
            return res.status(500).send({ status: false, message: "please provide correct reviewId" })
        }

        await reviewModel.updateMany({ _id: reviewId },
            {
                $set: finalFilter

            })

        const updatedReview = await reviewModel.findById(reviewId)



        return res.status(200).send({ status: true, message: "success", data: updatedReview })




    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
// --------------------------------------------------------------------------------------------------------------------------------


const deleteReview = async function (req, res) {

    try {

        let requestedparams = req.params
        const { bookId, reviewId } = requestedparams

        if (!isValid(bookId)) {
            return res.status(400).send({
                status: false,
                message: "please provide bookId in params"
            })
        }
        if (!isValid(reviewId)) {
            return res.status(400).send({
                status: false,
                message: "please provide reviewId in params"
            })
        }


        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "please provide valid bookId" })
        }
        if (!isValidObjectId(reviewId)) {
            return res.status(400).send({ status: false, message: "please provide valid reviewId" })
        }


        let isReviewIdExist = await reviewModel.findById(reviewId)

        if (isReviewIdExist) {


            if (isReviewIdExist.isDeleted === true) {
                return res.status(400).send({ status: false, message: "review already deleted" })
            }

            if (isReviewIdExist.bookId == bookId) {
                let isBookIdExist = await bookModel.findOne({ $and: [{ _id: bookId }, { isDeleted: false }] })
                if (!isBookIdExist) {
                    return res.status(400).send({ status: false, message: "please provide correct bookId" })
                }
            } else {
                return res.status(400).send({ status: false, message: "please provide correct reviewId and bookId that is related" })
            }
        } else {
            return res.status(400).send({ status: false, message: "please provide correct reviewId" })
        }


        let updateisDeleted = await reviewModel.findOneAndUpdate({ _id: reviewId }, { isDeleted: true })

        if (updateisDeleted) {
            await bookModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: -1 } })
        }


        return res.status(400).send({ status: true, message: "blog successfully deleted" })


    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
// -----------------------------------------------------------------------------------------------------------------------------------------














module.exports = { createReview, updateReview, deleteReview }