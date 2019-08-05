'use strict';
const MessageModel = require('../models/messages');

const getMessage = (req, res, next) =>{
   MessageModel.findOne({id: req.params.messageid}, function(err, entry){
       if(err) {return next(err);}
       res.json(entry)
   })
}


module.exports = getMessage;