const express = require('express')
const app = express()
app.use(express.urlencoded({extended:false}))
app.use(express.json())
const {registerValidator, loginValidator} = require('./middlewares/form-validator')
const db = require('./db/connect')
const bcrypt = require('bcrypt')
const {generateAccessToken, generateRefreshToken} = require('./controllers/authController')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const movieRouter = require('./routes/movieRouter')


app.post('/register', registerValidator, (req, res)=>{
    db.query(`select username from users where username = '${req.body.email}'`, (err, result) => {
        if(err) {
            console.log('Error: ' + err)
        } else {
            if(result.length >= 1) {
                return res.status(200).json( {msg: 'Username already exists', result} )
            } else {
                const hashPassword = bcrypt.hashSync(req.body.password, 10)
                db.query(`insert into users (firstname, lastname, username, password) values ('${req.body.firstname}','${req.body.lastname}','${req.body.email}','${hashPassword}')`, (err, result)=> {
                    if(err) {
                        console.log('Error:' + err)
                    }
                    console.log('New User Created')
                    res.status(201).send({msg:'New User Created'})
                })
            }
        }
    })
    
})

app.post('/login',loginValidator, (req, res)=>{
    const {username, password} = req.body
    // authenticate user
    db.query(`select id from users where username = '${username}'`, (err, result)=> {
        if(err) {
            console.log('Error:' + err)
        } else {
            if(result && result.length === 0) {
                return res.status(400).json({msg: 'Invalid username or password'})
            } else {
                const userId = Number(result[0]['id']);
                db.query(`select password from users where id = '${userId}'`, async (err, result)=> {
                    if(err) {
                        return res.status(400).json({msg: 'Invalid username or password'})
                    } else {
                        if(result && result.length == 0) {
                            return res.status(400).json({msg: 'Invalid username or password'})
                        } else {
                            const passwordFromDB = result[0]['password'];
                            if(bcrypt.compareSync(password, passwordFromDB)) {
                                const user = {id: userId, username: username}
                                const accessToken = generateAccessToken(user)
                                const refreshToken = generateRefreshToken(user)
                                const query = `update users set refresh_token ='${refreshToken}' where id='${userId}'`
                                db.query(query, (err, result) => {
                                    if(err) {
                                        console.log('Error: ' + err)
                                    } else {
                                        if(result["changedRows"] === 1) {
                                            // return res.status(200).send({ result })
                                            res.status(200).send({ msg:'Success', accessToken: accessToken, refreshToken: refreshToken})
                                        } else {
                                            return res.send(500).json({msg: 'Inavlid Username or Password'})
                                        }
                                    }
                                })     
                            } else {
                                res.status(401).send('Not Allowed')
                            }
                        }
                    }
                })
            }
        }
    })
})

app.post('/token', (req, res) => {
    const refreshToken = req.body.token
    // console.log({refreshToken})
    if(refreshToken === null || refreshToken === '') return res.sendStatus(401)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(403)
        const accessToken = generateAccessToken({ id: user.id, username: user.username })
        res.json({accessToken: accessToken})
    })
})

app.delete('/logout', (req, res) => {})

app.use('/movies', movieRouter)

const PORT = process.env.PORT | 5000;
app.listen(PORT, () => {
    console.log('App is listening on port 5000...')
    db.connect(err => {
        if(!err) {
            console.log('DB connected...');
        } else {
            console.log('DB connection failed');
        }})
})