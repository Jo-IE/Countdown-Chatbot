'use strict'

const request = require('request');
const MessageModel = require('../models/messages');
const User = require('../models/users');
var state = {message:"", count:0};

const https = require('https');
require('dotenv').config();


const getCountDown = function(datestring){
    if(datestring != 'null'){
    // insert current year into birth date string
    var currentYear = new Date().getFullYear();
    var monthandDay = datestring.slice(5,10);
    var bday = new Date(currentYear + "-"+ monthandDay);
    var today = Date.now();
    // calculate countdown
    var countdown = Math.round((bday - today)/(1000*24*60*60));
    // if countdown is negative, user's birthday has passed, calculate next year's countdown
     if (countdown < 0){
         let nextYear = currentYear + 1;
         let nextBday = new Date(nextYear + "-"+ monthandDay);
         countdown = Math.round((nextBday - today)/(1000*24*60*60));
     }
    }
     return countdown;
}

const receivedMessage = function(event){
    const senderID = event.sender.id;
    const recipientID = event.recipient.id;
    const timeofMessage = event.timestamp;
    const message = event.message;

    const messageID = message.mid;
    const messageText = message.text;
    const messageAttachments = message.attachments;
    const greetingConfidence = message.nlp && message.nlp.entities && message.nlp.entities.greetings && message.nlp.entities.greetings[0].confidence;
    var response;

    if(typeof messageText !== 'undefined'){
        
       //detect keywords
        const nameRegex = /name/;
        const dateRegex = /\d{4}-\d{2}-\d{2}/;
        const positiveRegex = /^ye(ah){0,1}(s){0,1}(up)?$/;
        const negativeRegex = /^n(ah)?(ope)?(o)?$/;
       

        // message is the first message by user and it is a greeting
        if(state.count===0 && ((typeof greetingConfidence !== 'undefined') && greetingConfidence > 0.9)){
            response = 'What is your name?';
            sendTextMessage(senderID, response);
            state.count = 1;
            state.message=response;
        }
        // the last message asked for a name or 'name' is included in the message
        else if (state.message==='What is your name?' || nameRegex.test(messageText)){
            
            response = 'What is your birth date (YYYY-MM-DD)?';
            sendTextMessage(senderID, response);
            state.count = 2;
            state.message = response;
        }
        //message is a date in the right format
        else if(dateRegex.test(messageText)){
           var DOB = messageText.match(dateRegex);
           // create a new user
           var newUser = new User({
            senderid:senderID,
            birthday:DOB.toString()
        })
            newUser.save(function(err, user){
                if(err){console.log(err);}
            })
            response = 'Would you like to know the number of days till your next birthday (yes/no)?'
            sendTextMessage(senderID, response);
            state.count = 3;
        } 
        // user has given a birthdate and agreed to receive a countdown
        else if(state.count === 3 && positiveRegex.test(messageText)){
            User.findOne({senderid:senderID}, function(err,user){
                const countDown = getCountDown(user.birthday);
                if(countDown < 1){
                response = `It's your birthday! Happy Birthday!`
                sendTextMessage(senderID, response)
                }
                else if(countDown > 10){
                response = `There are ${countDown} days left till your next birthday!`
                sendTextMessage(senderID, response)
                }else{
                    //user's birthday is coming up soon, ask for location to give restaurant suggestions
                    response = `There are ${countDown} days left till your next birthday! May I have your location to suggest a good place to party?`
                    sendTextMessage(senderID, response)
                }
            })
            state.count = 4;
        } 
        // user has given a birthdate and refused to receive a countdown.
        else if(
            (state.count===3 && negativeRegex.test(messageText)) || 
            (state.count===4 && negativeRegex.test(messageText)) ){
            var wave = String.fromCodePoint(128075);
            response='Goodbye ' + wave;
            sendTextMessage(senderID, response);
            User.findOneAndDelete({senderid:senderID}, function(err, user){
                if(err){console.log(err);}
            })
            state.count=0;
            state.message = ''
        } 
        //none of the above applies
        else {
            response = `Sorry, I couldn't understand you`;
            sendTextMessage(senderID, response);
        }
        return response;
       
        
    }
    else if(typeof messageAttachments !== 'undefined'){
        
        if(message.attachments[0].payload.coordinates){
            // message is a location coordinate
            var lat = message.attachments[0].payload.coordinates.lat;
            var long = message.attachments[0].payload.coordinates.long;
            var url = 'https://places.cit.api.here.com/places/v1/discover/explore?at='+lat+','+long+'&cat=eat-drink&app_id='+process.env.APP_ID+'&app_code='+process.env.APP_CODE;
          
            
            return https.get(url, (resp) => {
                let data = '';
              
                // A chunk of data has been recieved.
                resp.on('data', (chunk) => {
                  data += chunk;
                });
              
                // The whole response has been received. Print out the result.
                resp.on('end', () => {
                    response = data.results.items.map((item) => {
                        return item.title + " " + "(" + item.openingHours.text + ")" + "\n"});
                        sendTextMessage(senderID, response);
                       
                });
              
              }).on("error", (err) => {
                console.log("Error: " + err.message);
              });
        }
        
    }

}


const handlePost = (req, res) => {
    if(req.body.object === 'page'){

        req.body.entry.forEach(entry => {
            const pID = entry.id;
            const timeStamp = entry.time;

            entry.messaging.forEach(evt =>{
                if(evt.message){
                    receivedMessage(evt);
                }
                    
            })
        })
        res.sendStatus(200);
    }
}






const sendAPI = function(msgData){
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: msgData

    }, function(err, res, body){
        if (!err && res.statusCode == 200) {
            var recipientId = body.recipient_id;
            var messageId = body.message_id;

            // save message in database
            var newMessage = new MessageModel(
                {
                    id: messageId,
                    message: msgData.message.text
                }
            )
            newMessage.save(function(err){
                if (err){console.log(err);}
            })
        } else{
            console.log("Unable to send message.");
            //console.log(res);
            console.log(err);
        }
    })
}

function sendTextMessage(recipientID, messageText){
    var msgData = {
        recipient: {
            id: recipientID
        },
        message: {
            text: messageText
        }
    }
    sendAPI(msgData);
    return msgData;
}
module.exports = {handlePost, receivedMessage, getCountDown, sendTextMessage, sendAPI};