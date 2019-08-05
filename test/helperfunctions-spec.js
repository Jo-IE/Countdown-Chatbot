const expect = require("chai").expect;
const {handlePost, receivedMessage, getCountDown, sendTextMessage, sendAPI} = require('../controllers/posthandler')

    
    describe("receivedMessage(event)", function(){
        
        it("should respond to the first word/ a greeting", function(){
            var event = {
                message:{
                    text: "hi",
                    id: "01222",
                    nlp: {
                        entities:{
                            greetings:[
                                {
                                    confidence: 0.92
                                }
                            ]
                        }
                    }
                },
                sender:{
                    id: "21331"
                },
                recipient:{
                    id: "3132"
                },
                timestamp:"05:15"
            }
                var results = receivedMessage(event);
                expect(results).to.equal("What is your name?")
        })
        it("should respond after user gives their name", function(){
            var event = {
                message:{
                    text: "my name is Jackee",
                    id: "01223"
                },
                sender:{
                    id: "21331"
                },
                recipient:{
                    id: "3132"
                },
                timestamp:"05:15"
            }
                var results = receivedMessage(event);
                expect(results).to.equal("What is your birth date (YYYY-MM-DD)?")
        })
        it("should respond after user gives their birthdate", function(){
            var event = {
                message:{
                    text: "I was born on 2000-09-09",
                    id: "01224"
                },
                sender:{
                    id: "21331"
                },
                recipient:{
                    id: "3132"
                },
                timestamp:"05:15"
            }
                var results = receivedMessage(event);
                expect(results).to.equal("Would you like to know the number of days till your next birthday (yes/no)?")
        })
        it("should respond say goodbye if user doesnt want to know their birthday countdown", function(){
            var event = {
                message:{
                    text: "nah",
                    id: "01225"
                },
                sender:{
                    id: "21331"
                },
                recipient:{
                    id: "3132"
                },
                timestamp:"05:15"
            }
                var wave = String.fromCodePoint(128075);
                var results = receivedMessage(event);
                expect(results).to.equal("Goodbye " + wave);
        })
        it("restart the process after Goodbye", function(){
            var event = {
                message:{
                    text: "Actually my name is Marci",
                    id: "01226"
                },
                sender:{
                    id: "21331"
                },
                recipient:{
                    id: "3132"
                },
                timestamp:"05:15"
            }
                var results = receivedMessage(event);
                expect(results).to.equal("What is your birth date (YYYY-MM-DD)?")
        })
        it("should respond when user makes unrelated statement", function(){
            var event = {
                message:{
                    text: "yes",
                    id: "01227"
                },
                sender:{
                    id: "21331"
                },
                recipient:{
                    id: "3132"
                },
                timestamp:"05:15"
            }
                var results = receivedMessage(event);
                expect(results).to.equal("Sorry, I couldn't understand you")
        })

        it("should respond when user makes unrelated statement", function(){
            var event = {
                message:{
                    text: "What's for dinner?",
                    id: "01228"
                },
                sender:{
                    id: "21331"
                },
                recipient:{
                    id: "3132"
                },
                timestamp:"05:15"
            }
                var results = receivedMessage(event);
                expect(results).to.equal("Sorry, I couldn't understand you")
        })
    })


    describe("getCountDown(datestring)", function(){
        it("should respond with an integer", function(){
            var datestring = "2000-09-09"
                let results = getCountDown(datestring);
                expect(results % 1).to.equal(0)
        })
        /*it("2010-08-16 should equal 15", function(){
            var datestring = "2010-08-16"
                let results = getCountDown(datestring);
                expect(results).to.equal("15")
        })*/
    })

    describe("sendTextMessage(recipientID, messageText)", function(){
        it("should return an object", function(){
            let recipientID = "5146";
            let messageText = "What is your name?"
            let results = sendTextMessage(recipientID, messageText);
            expect(results).to.be.a('object')
            expect(results).to.be.have.property('recipient')
            expect(results).to.be.have.property('message')
        })
        it("object should contain correct values", function(){
            let recipientID = "5146";
            let messageText = "What is your name?"
            let results = sendTextMessage(recipientID, messageText);
            expect(results).to.be.have.property('recipient').eql({'id':"5146"})
            expect(results).to.be.have.property('message').eql({"text": "What is your name?"})

        })
    })
