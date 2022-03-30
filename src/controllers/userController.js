const userModel = require("../models/userModel")

const jwt = require("jsonwebtoken")



const regex = /^([a-zA-Z0-9\.-]+)@([a-zA-Z0-9-]+).([a-z]+)$/;  

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}


const isValidTitle = function (title) {
    return ['Mr', 'Mrs', 'Miss', 'Mast'].indexOf(title) !== -1
}
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
  }

const createUser = async function (req, res) {
    try {
        let requestBody = req.body

        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide user detalls' })
            return
          }
        const { title, name, phone, email, password } = requestBody
        if (!isValid(title)) {
            return res.status(400).send({ status: false, msgsage: "please enter title" });
        }

        if (isValidTitle(title)) {
            return res.status(400).send({ status: false, msgsage: "please enter valid title" });
        }

        if (!isValid(name)) {
            res.status(400).send({ status: false, message: "please enter name" })
        }

        if (!isValid(phone)) {
            return res.status(400).send({ status: false, message: "please enter phone number" })
        }
        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "please enter email" })
        }

        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "please enter password" })
        }

        const mobileRegex = /^([0-9]){10}$/;
        if (!mobileRegex.test(phone.trim())) {
            return res.status(400).send({
                status: false, message: " PHONE NUMBER is not a valid mobile number",
            });
        }

     //using regex we will verify the email is valid or not

        if (!regex.test(email.trim())) {
            return res.status(400).send({ status:false,message: "EMAIL is not valid" })
        }

        let isPhoneNumberAlreadyUsed = await userModel.findOne({ phone })
        if(isPhoneNumberAlreadyUsed){
            return res.status(400).send({status:false,message:" PHONE  NUMBER is already used"})
        }
       
        
        let isEmailAlreadyUsed = await userModel.findOne({ email})
        if(isEmailAlreadyUsed){
            return res.status(400).send({status:false,message:"EMAIL is already used"})
        }
       
       if(password.length<8){
           return res.status(400).send({status:false,message:"password must be more than eight char"})
       }
       if(password.length>15){
        return res.status(400).send({status:false,message:"password must be less than eight char"})
    }

    let userCreated = await userModel.create(requestBody)
      return res.status(201).send({status:false,message:"success",data:userCreated})

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }

}
// -----------------------------------------------------------------------------------------------------------------------------------


const createLogin = async function(req,res){
    try{
     let requestBody = req.body

     if (!isValidRequestBody(requestBody)) {
       return res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide author detalls' })
       
      }
     const {email,password} = requestBody


     if(!isValid(email)){
        return  res.status(400).send({ status: false, message: 'please enter email' })
     }
     if(!isValid(password)){
        return  res.status(400).send({ status: false, message: 'please enter password' })
     }

      //using regex we will verify the email is valid or not

     if (!regex.test(email.trim())) {
         return res.status(400).send({ msg: "EMAIL is not valid" })
     }

     let isUserExists= await userModel.findOne({ email,password})
        if(!isUserExists){
            return res.status(400).send({status:false,ERROR:"please provide correct email and password"})
        }

        
        let token =jwt.sign({
            userId : isUserExists._id,
            iat : Math.floor(Date.now() / 1000),
            // exp : Math.floor(Date.now() / 1000) + 10*60*30

        },"projectBookManagement",{expiresIn:"60m"})
      
         

        res.header("x-api-key", token);

        res.send({ status: true, data: token })
 
    }catch(err){
        res.status(500).send({status:false,ERROR:err.message})
    }
}






module.exports={createUser,createLogin}


// console.log(/^(?=.*\d)(?=(.*\W){2})(?=.*[a-zA-Z])(?!.*\s).{1,15}$/.test(foo));

//     /**
//      * (?=.*\d)         should contain at least 1 digit
//      * (?=(.*\W){2})    should contain at least 2 special characters
//      * (?=.*[a-zA-Z])   should contain at least 1 alphabetic character
//      * (?!.*\s)         should not contain any blank space
//      */
// })();





