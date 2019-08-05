'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const authWebhook = require('./controllers/webhook');
const {handlePost} = require('./controllers/posthandler.js');
const displayMessages = require('./controllers/displaymessages');
const getMessage = require('./controllers/getuniquemessage');
const deleteMessage = require('./controllers/deletemessage')
const mongoose = require('mongoose');

require('dotenv').config()

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useFindAndModify: false});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error: '))


//mount middleware
app.use(bodyParser.urlencoded({extended:false}));

app.use(bodyParser.json());

//mount routes
app.get('/', authWebhook);
app.post('/', handlePost);
app.get('/messages', displayMessages);
app.get('/:messageid', getMessage);
app.delete('/delete/:messageid', deleteMessage);

//listen for requests
app.listen(3000, () => console.log('Sever is now listening on port 3000'))

module.exports=app;