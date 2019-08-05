var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    id: {type: String, required: true},
    message : {type: String, required: true}
})

module.exports = mongoose.model('Messages', MessageSchema)