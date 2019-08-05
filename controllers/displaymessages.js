'use strict';
const MessageModel = require('../models/messages');

const displayMessages = (req, res, next) =>{
   MessageModel.find({}, function(err, entries){
       if(err) {return next(err);}
       res.json(entries)
   })
}


module.exports = displayMessages;