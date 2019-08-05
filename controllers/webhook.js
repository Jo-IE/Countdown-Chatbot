'use strict';

const authWebhook = (req, res) => {
    let TOKEN = 'birthday-bot';
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if(mode && token === TOKEN){
        res.status(200).send(challenge);
    } else{
        res.sendStatus(403);
    }
}

module.exports = authWebhook;