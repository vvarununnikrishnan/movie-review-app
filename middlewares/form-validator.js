const express = require('express')

const fastestValidator = require('fastest-validator')
const validator = new fastestValidator()
const schema = {
    firstname: { type: "string", alpha: true, min:3, max:10 },
    lastname: { type: "string", alpha: true, min:3, max:10 },
    email: { type: "email" },
    password: { type: "string", min: 8, max: 15 }
};

const registerValidator = (req, res, next) => {
    const {firstname, lastname, email, password} = req.body
    // console.log(firstname, lastname, email, password);
    const check = validator.compile(schema);

    const result = check({firstname, lastname,email, password})
    if(result && typeof result === 'object') {
        console.log('Invalid User Details');  
        // console.log(result.length); 
        return res.status(400).json({result}) 
    } else {
        console.log('Valid user');
        // console.log(result);
        next()
    }
}

const loginSchema = {
    username: { type: "email", alpha: true},
    password: { type: "string"}
};

const loginValidator = (req, res, next)=> {
    const {username, password} = req.body
    const check = validator.compile(loginSchema);
    const result = check({username, password})
    if(username === '' || password === '') {
        return res.json({msg: "Username and password are required"})
    } else {
        next()
    }
}



module.exports = {registerValidator, loginValidator}

