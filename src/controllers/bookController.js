
const bookModel = require('../models/bookModel')
const userModel = require('../models/userModel')
const reviewModel = require('../models/reviewModel');
const validator = require("../validators/validator")
const moment = require('moment')





const createBook = async function (req, res) {
    try {

        const requestBody = req.body

        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide book detalls' })
        }
        const { title, excerpt, userId, ISBN, category, subCategory, releasedAt } = requestBody

        if (res.userId != userId) {
            return res.status(403).send({ status: false, message: " you are not authorised" })
        }

        if (!validator.isValid(title)) {
            return res.status(400).send({ status: false, message: "please enter title" })
        }
        if (!validator.isValid(excerpt)) {
            return res.status(400).send({ status: false, message: "please enter expcerpt" })
        }
        if (!validator.isValid(userId)) {
            return res.status(400).send({ status: false, message: "please enter userId" })
        }
        if (!validator.isValid(ISBN)) {
            return res.status(400).send({ status: false, message: "please enter ISBN" })
        }
        if (isNaN(ISBN)) {
            return res.status(400).send({ status: false, message: "ISBN must  be in Numbers " })
        }
        if (!validator.isValid(category)) {
            return res.status(400).send({ status: false, message: "please enter category" })
        }
        if (!validator.isValid(subCategory)) {
            return res.status(400).send({ status: false, message: "please enter subCategory" })
        }
        if (!validator.isValid(releasedAt)) {
            return res.status(400).send({ status: false, message: "please enter releasedAt" })
        }

        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "please enter valid userId" })
        }

        if (!moment(releasedAt, "YYYY-MM-DD").isValid()) {
            return res.status(400).send({ status: false, message: "please provide releasedAt correct date and in YYYY-MM-DD format" })
        }

        const isTitleAlreadyExist = await bookModel.findOne({ title })
        if (isTitleAlreadyExist) {
            return res.status(400).send({ status: false, message: 'title is already exists ' })
        }
        let isISBNAlreadyExist = await bookModel.findOne({ ISBN })
        if (isISBNAlreadyExist) {
            return res.status(400).send({ status: false, message: 'ISBN is already exists ' })
        }

        const isUserIdExist = await userModel.findOne({ _id: userId })

        if (!isUserIdExist) {
            return res.status(404).send({ status: false, message: 'please enter correct userId' })
        }

        if (req.userId != isUserIdExist.userId) {
            return res.status(403).send({ status: false, message: " you are not authorised" })

        }

        const bookCreation = await bookModel.create(requestBody)
        return res.status(201).send({ status: true, message: "success", data: bookCreation })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}

//---------------------------------------------------------------------------------

const getBooks = async function (req, res) {
    try {
        const requestQuery = req.query
        if (!requestQuery) {
            return res.status(400).send({ status: false, ERROR: "please provide the query" })
        }
        const { userId, category, subCategory } = requestQuery
        const finalFilter = []

        if (validator.isValid(userId)) {
            if (validator.isValidObjectId(userId)) finalFilter.push({ userId })

        }
        if (validator.isValid(category)) {
            finalFilter.push({ category })
        }
        if (validator.isValid(subCategory)) {
            finalFilter.push({ subCategory })
        }


        const findBooks = await bookModel.find({ $and: [{ $or: finalFilter }, { isDeleted: false }] })
            .sort({ title: 1 })
            .select({ ISBN: 0, subCategory: 0, isDeleted: 0, deletedAt: 0, __v: 0 })

        if (!findBooks.length) {
            return res.status(404).send({ status: false, message: "No Books found" })
        }
        res.status(200).send({ status: false, message: "Book List", data: findBooks })

    } catch (err) {
        return res.status(500).send({ status: true, ERROR: err.message })
    }

}


const getBookDetails = async function (req, res) {
    try {

        let bookId = req.params.bookId

        if (!validator.isValid(bookId)) {
            return res.status(400).send({ status: false, message: "please provide bookId" })
        }
        if (!validator.isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "please provide valid bookId" })
        }

        const bookIdData = await bookModel.findById({ _id: bookId }).select({ __v: 0 }).lean()

        if (!bookIdData) {
            return res.status(404).send({ status: false, message: "no documents  found" })
        }



        const reviewData = await reviewModel.find({ $and: [{ bookId: bookId }, { isDeleted: false }] })
            .select({ isDeleted: 0, __v: 0, createdAt: 0, updatedAt: 0 })

        if (reviewData.length != 0) {
            bookIdData["reviewsData"] = reviewData
        } else {
            bookIdData["reviewsData"] = []
        }


        return res.status(200).send({ status: false, message: "book list", data: bookIdData })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }


}

// -------------------------------------------------------------------------------------------------------------------------------------------



const updateBookDetails = async function (req, res) {
    try {
        const requestBody = req.body
        const { title, excerpt, releasedAt, ISBN } = requestBody
        const bookId = req.params.bookId

        const finalFilter = {}

        if (!validator.isValid(bookId)) {
            return res.status(400).send({ status: false, message: "please provide bookId" })
        }
        if (!validator.isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "please provide valid bookId" })
        }

        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "please provide input via body" })
        }

        if (validator.isValid(title)) {

            const isTitleAlreadyExist = await bookModel.findOne({ $and: [{ title: title }, { isDeleted: false }] })

            if (isTitleAlreadyExist) {
                return res.status(400).send({ status: false, message: "title already exists" })
            }

            finalFilter["title"] = title

        }

        if (validator.isValid(excerpt)) {
            finalFilter["excerpt"] = excerpt
        }
        if (validator.isValid(releasedAt)) {

            if (!moment(releasedAt, "YYYY-MM-DD").isValid()) {
                return res.status(400).send({ status: false, message: "please provide releasedAt correct date and in YYYY-MM-DD format" })
            }
            finalFilter["releasedAt"] = releasedAt
        }
        if (validator.isValid(ISBN)) {
            if (isNaN(ISBN)) {
                return res.status(400).send({ status: false, message: "ISBN must  be in Numbers " })
            }

            const isISBNAlreadyExist = await bookModel.findOne({ $and: [{ ISBN: ISBN }, { isDeleted: false }] })

            if (isISBNAlreadyExist) {
                return res.status(400).send({ status: false, message: "ISBN already exists" })
            }

            finalFilter["ISBN"] = ISBN
        }

        const isBookIdExist = await bookModel.findById(bookId)
        if (isBookIdExist) {
            return res.status(404).send({ status: false, message: "no book exists" })
        }

        if (res.userId != isBookIdExist.userId) {
            return res.status(403).send({ status: false, message: " you are not authorised" })
        }

        const updatedData = await bookModel.findOneAndUpdate({ _id: bookId }, { $set: finalFilter }, { new: true })

        return res.status(200).send({ status: true, message: "success", data: updatedData })


    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}

// -------------------------------------------------------------------------------


const deleteBook = async function (req, res) {

    try {
        const bookId = req.params.bookId

        if (!validator.isValid(bookId)) {
            return res.status(400).send({ status: false, message: "please provide bookId" })
        }

        if (!validator.isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "please provide valid bookId" })
        }

        const isBookIdExist = await bookModel.findById(bookId)

        if (req.userId != isBookIdExist.userId) {
            return res.status(403).send({ status: false, message: " you are not authorised" })
        }

        if (!isBookIdExist) {
            return res.status(404).send({ status: false, message: "please provide correct bookId" })
        }

        if (isBookIdExist.isDeleted == true) {
            return res.status(404).send({ status: false, message: "book already deleted" })
        }

        const deleteBook = await bookModel.findOneAndUpdate({ _id: bookId }, { $set: { isDeleted: true, isDeletedAt: new Date() } }, { new: true })

        if (deleteBook) {
            return res.status(200).send({ status: true, message: "book deleted successfully" })
        }

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}

module.exports = {
    createBook, getBooks, getBookDetails, updateBookDetails, deleteBook
}