//importing the userModel , validator & jsonwebtoken
const userModel = require("../models/userModel")
const validator = require("../validators/validator")
const jwt = require("jsonwebtoken")





// registeration API
const createUser = async function (req, res) {
    try {
        const requestBody = req.body       // taking input from body

        const { title, name, phone, email, password } = requestBody       // object destructuring

        //  input validation 
        if (!validator.isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide user detalls' })
            return
        }

        if (!validator.isValid(title)) {
            return res.status(400).send({ status: false, msgsage: "please enter title" });
        }

        if (!validator.isValidTitle(title)) {
            return res.status(400).send({ status: false, msgsage: "please enter valid title" });
        }

        if (!validator.isValid(name)) {
            return res.status(400).send({ status: false, message: "please enter name" })
        }

        if (!validator.isValid(phone)) {
            return res.status(400).send({ status: false, message: "please enter phone number" })
        }
        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, message: "please enter email" })
        }

        if (!validator.isValid(password)) {
            return res.status(400).send({ status: false, message: "please enter password" })
        }

        // using regex we will verify the phone  Number is valid or not

        if (!(!isNaN(phone))   &&  /^([0-9]){10}$/.test(phone.trim())) {
            return res.status(400).send({
                status: false, message: " PHONE NUMBER is not a valid mobile number",
            });
        }

        //using regex we will verify the email is valid or not

        if (!/^([a-z0-9\.-]+)@([a-z0-9-]+).([a-z]+)$/.test(email.trim())) {
            return res.status(400).send({ status: false, message: "EMAIL is not valid" })
        }

        const isPhoneNumberAlreadyUsed = await userModel.findOne({ phone })
        if (isPhoneNumberAlreadyUsed) {
            return res.status(400).send({ status: false, message: " PHONE  NUMBER is already used" })
        }


        const isEmailAlreadyUsed = await userModel.findOne({ email })
        if (isEmailAlreadyUsed) {
            return res.status(400).send({ status: false, message: "EMAIL is already used" })
        }

        // checking the password length
        if (password.length < 8) {
            return res.status(400).send({ status: false, message: "password must be more than eight char" })
        }
        if (password.length > 15) {
            return res.status(400).send({ status: false, message: "password must be less than eight char" })
        }

        const userCreated = await userModel.create(requestBody)
        return res.status(201).send({ status: false, message: "success", data: userCreated })

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }

}
// -----------------------------------------------------------------------------------------------------------------------------------

//Login API 
const createLogin = async function (req, res) {
    try {
        const requestBody = req.body

        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide author detalls' })

        }
        const { email, password } = requestBody

        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, message: 'please enter email' })
        }
        if (!validator.isValid(password)) {
            return res.status(400).send({ status: false, message: 'please enter password' })
        }

        //using regex we will verify the email is valid or not

        if (!/^([a-z0-9\.-]+)@([a-z0-9-]+).([a-z]+)$/.test(email.trim())) {
            return res.status(400).send({ msg: "EMAIL is not valid" })
        }

        const isUserExists = await userModel.findOne({ email, password })
        if (!isUserExists) {
            return res.status(400).send({ status: false, ERROR: "please provide correct email and password" })
        }


        let token = jwt.sign({
            userId: isUserExists._id,

        }, "projectBookManagement", { expiresIn: "60m" })



        res.header("x-api-key", token);

        res.status(200).send({ status: true, data: token })

    } catch (err) {
        res.status(500).send({ status: false, ERROR: err.message })
    }
}






module.exports = { createUser, createLogin }






