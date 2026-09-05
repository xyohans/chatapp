const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors')


app.use(express.json());
app.use(cors());  // Allow all origins for development


const otp = require('./routes/otp')
const userProfile = require('./routes/user-profile')
const chat = require('./routes/chat');




app.use('/', userProfile)
app.use('/', otp)
app.use('/', chat);


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});