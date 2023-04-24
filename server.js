require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/register');
const saltRounds = 6;
const jwt = require('jsonwebtoken');
const app = express();
const secretKey = 'sujalbhaiya';


app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/register',async (req,res)=>{
  console.log(req.body);
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  try{
    const hashedpd = await bcrypt.hash(password,saltRounds);
    const insertResult = await User.create({
      username:name,
      email:req.body.email,
      password:hashedpd,
    });
    const token = jwt.sign({username:insertResult.username},secretKey);
    res.send({token});
  } catch(error){
    console.log(error);
    res.status(500).send("Internal server error");
  }

});

app.post('/login',async (req,res)=>{
  try{
    const user = await User.findOne({email:req.body.email});
    console.log(user);
    if(user){
      const cmp = await bcrypt.compare(req.body.password,user.password);
      if(cmp){
        const token = jwt.sign({username:user.username},secretKey);
        res.send({token});
      } else{
        res.send("Wrong username or password");
      }
    } else{
      res.send("Wrong username or password");
    }
  } catch(error){
    console.log(error);
    res.status(500).send("Internal Server error Occured");
  } 
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});