var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
    senderid : {type: String, required: true},
    birthday: {type: String}
})

module.exports = mongoose.model('Users', UserSchema)