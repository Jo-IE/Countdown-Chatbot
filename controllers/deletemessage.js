'use strict';
const MessageModel = require('../models/messages');

const deleteMessage = (req, res, next) =>{
   MessageModel.findOneAndDelete({id: req.params.messageid}, function(err, entry){
       if(err) {return next(err);}
       res.json({'success': "message was deleted"})
   })
}


module.exports = deleteMessage;