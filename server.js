const express = require('express')
const app = express()
const mysql = require('mysql')
const path = require('path')
const multer = require('multer')


app.set('view engine', 'ejs')
app.use(express.urlencoded({extended : true}))
app.use(express.static('public'));

const database = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'remy1234@Athecoder',
    database : 'app_datas'
})
database.connect();

let imageName = 0;
const storage = multer.diskStorage({
    destination : (req, file, cb) => {
        cb(null,'public/images')
    },
    filename : (req, file, cb)=>{
        console.log(file)
        cb(null, imageName = Date.now() + path.extname(file.originalname))
        console.log(imageName)
    }
})
const upload = multer({storage: storage});

app.get('/login', (req , res) => {
    res.render('login.ejs')
})
let dbUserData = 0;
app.post('/login', (req , res) => {
    database.query('SELECT * FROM users where email=?',req.body.email,(err, results)=>{
        if(err) throw err
        dbUserData = results;
        if(dbUserData[0].email == req.body.email && dbUserData[0].password == req.body.password){
            res.redirect('/home')
        }else{
            res.send('Invalid credentials, please re-write them carefully!')
        }
    })
})
app.get('/register', (req , res) => {
    res.render('register.ejs')
})
app.post('/register', (req , res) =>{
    if(req.body.email == '' || req.body.names == '' || req.body.password == '' || req.body.description == ''){
        res.send('please fill the registration form completely!')
    }else{
        database.query(`INSERT INTO users (names,password,email,description) VALUES ('${req.body.names}','${req.body.password}','${req.body.email}','${req.body.description}');`, (err , results) =>{
            if(err) throw err
        });
        res.redirect('/login')
    }
})
app.get('/home', (req , res) => {
    res.render('index.ejs', {dbUserData})
})
app.post('/home', upload.single('image'),(req , res) => {
    res.redirect('/home')
    const realImage = path.join(__dirname, `public/images/${imageName}`)
    database.query(`UPDATE users SET image='${realImage}' WHERE email=?;`, dbUserData[0].email, (err , data) => {
        if(err) throw err
    })
})
app.listen(5000, () => console.log('listening on port 5000 ...'))
