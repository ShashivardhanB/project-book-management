const reviewModel = require('../models/reviewModel')
const bookModel = require('../models/bookModel')
const validator = require("../validators/validator")

const createReview = async function (req, res) {
    try {

        const requestBody = req.body
        const { rating, reviewedBy, review } = requestBody
        const bookId = req.params.bookId


        if (!validator.isValid(bookId)) return res.status(400).send({ status: false, message: "please provide bookId in params" })

        if (!validator.isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "please provide valid bookId" })

        if (!validator.isValidRequestBody(requestBody)) return res.status(400).send({ status: false, message: "please provide input via body" })

        if (!validator.isValid(rating)) {
            return res.status(400).send({ status: false, message: "please provide rating" })
        }
        if (isNaN(rating)) {
            return res.status(400).send({ status: false, message: "rating must  be in Numbers " })
        }
        const isBookIdExist = await bookModel.findById({ _id: bookId })

        if (!isBookIdExist) {
            return res.status(404).send({ status: false, message: "please provide correct bookId" })
        } else {
            requestBody["bookId"] = bookId
        }

        if (isBookIdExist.isDeleted === false) {
            return res.status(404).send({ status: false, message: "book is already deleted" })
        }

        if (reviewedBy != undefined) {
            if (reviewedBy.trim().length == 0) {
                requestBody["reviewedBy"] = "Guest"
            } else {
                requestBody["reviewedBy"] = reviewedBy
            }
        }


        if (rating < 1 || rating > 5) return res.status(400).send({ status: false, message: "please provide rating in between 1 to 5" })

        requestBody["reviewedAt"] = new Date();

        const reviewData = await reviewModel.create(requestBody)

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



const updateReview = async function (req, res) {
    try {
        const requestBody = req.body
        const { review, rating, reviewedBy } = requestBody
        const requestParams = req.params
        const { bookId, reviewId } = requestParams

        const finalFilter = {}

        if (!validator.isValid(bookId)) {
            return res.status(400).send({
                status: false,
                message: "please provide bookId in params"
            })
        }
        if (!validator.isValid(reviewId)) {
            return res.status(400).send({
                status: false,
                message: "please provide reviewId in params"
            })
        }

        if (!validator.isValidObjectId(bookId)) {
            return res.status(400).send({
                status: false,
                message: "please provide valid bookId"
            })
        }
        if (!validator.isValidObjectId(reviewId)) {
            return res.status(400).send({
                status: false,
                message: "please provide valid reviewId"
            })
        }



        if (validator.isValid(review)) {

            finalFilter["review"] = review

        }
        if (validator.isValid(rating)) {

            if (isNaN(rating)) {
                return res.status(400).send({ status: false, message: "rating must  be in Numbers " })
            }
            finalFilter["rating"] = rating
        }

        if (validator.isValid(reviewedBy)) {
            finalFilter["reviewedBy"] = reviewedBy
        }


        if (reviewedBy != undefined) {
            if (reviewedBy.trim().length == 0) {
                finalFilter["reviewedBy"] = "Guest"
            }
        }

        const isReviewIdExist = await reviewModel.findOne({ $and: [{ _id: reviewId }, { isDeleted: false }] })
        if (isReviewIdExist) {

            if (isReviewIdExist.bookId == bookId) {
                let isBookIdExist = await bookModel.findOne({ $and: [{ _id: bookId }, { isDeleted: false }] })
                if (!isBookIdExist) {
                    return res.status(404).send({ status: false, message: "book deleted" })
                }
            } else {
                return res.status(404).send({ status: false, message: "please provide correct reviewId and bookId that is related" })
            }
        } else {
            return res.status(404).send({ status: false, message: "please provide correct reviewId" })
        }



        if (Object.keys(finalFilter).length > 0) {
            finalFilter["reviewedAt"] = new Date();
        }

        const updatedReview = await reviewModel.findByIdAndUpdate({ _id: reviewId }, finalFilter, { new: true })

        return res.status(200).send({ status: true, message: "success", data: updatedReview })


    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

// --------------------------------------------------------------------------------------------------------------------------------


const deleteReview = async function (req, res) {

    try {

        const requestedparams = req.params
        const { bookId, reviewId } = requestedparams

        if (!validator.isValid(bookId)) {
            return res.status(400).send({
                status: false,
                message: "please provide bookId in params"
            })
        }
        if (!validator.isValid(reviewId)) {
            return res.status(400).send({
                status: false,
                message: "please provide reviewId in params"
            })
        }

        if (!validator.isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "please provide valid bookId" })
        }
        if (!validator.isValidObjectId(reviewId)) {
            return res.status(400).send({ status: false, message: "please provide valid reviewId" })
        }

        const isReviewIdExist = await reviewModel.findById(reviewId)

        if (isReviewIdExist) {

            if (isReviewIdExist.isDeleted === true) {
                return res.status(404).send({ status: false, message: "review already deleted" })
            }

            if (isReviewIdExist.bookId == bookId) {
                let isBookIdExist = await bookModel.findOne({ $and: [{ _id: bookId }, { isDeleted: false }] })
                if (!isBookIdExist) {
                    return res.status(404).send({ status: false, message: "please provide correct bookId" })
                }
            } else {
                return res.status(404).send({ status: false, message: "please provide correct reviewId and bookId that is related" })
            }
        } else {
            return res.status(404).send({ status: false, message: "please provide correct reviewId" })
        }

        const updateisDeleted = await reviewModel.findOneAndUpdate({ _id: reviewId }, { isDeleted: true })

        if (updateisDeleted) {
            await bookModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: -1 } })
        }

        return res.status(200).send({ status: true, message: "review  successfully deleted" })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createReview, updateReview, deleteReview }