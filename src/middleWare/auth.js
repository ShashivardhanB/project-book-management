const jwt = require('jsonwebtoken')



const auth = async function (req, res, next) {

    try {

        const token = req.headers["x-api-key"]
        if (!token) {
            return res.status(400).send({ status: false, message: "token must present" })
        }


        const isTokenValid = jwt.verify(token, "projectBookManagement")

        if (!isTokenValid) {

            return res.status(400).send({ status: false, message: "you are not authenticated to use" })
        }

        req.userId = isTokenValid.userId

    next()


    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }



    module.exports = {auth}













}

