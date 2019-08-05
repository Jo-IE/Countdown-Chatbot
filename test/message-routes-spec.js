process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const Messages = require('../models/messages');

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const should = chai.should();

chai.use(chaiHttp);



describe('Messages', () => {
    
    beforeEach("delete all messages", (done) => {
        Messages.deleteMany({}, err => {
            done()
        }).catch(done)
    });



describe('/GET/messages', function(){
    it('should get all messages', (done) => {
        chai.request(server)
        .get('/messages')
        .then((res) =>{
            
            should.exist(res);
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.eql(0);
            done();
        }).catch(done)
    })
})

describe('/GET/:messageid', () => {
    it('it should GET  a message with the given ID', (done) => {
        let msg = new Messages({
            id: "24883",
            message: "My name is Jackee"
        })
        msg.save((err, msg) => {
            chai.request(server)
            .get('/' + msg.id)
            .send(msg)
            .then((res) => {
                
                res.should.have.status(200);
                should.exist(res.body);
                res.body.should.be.a('object');
                res.body.should.have.property('id');
                res.body.should.have.property('message');
                res.body.should.have.property('id').eql(msg.id);
                res.body.should.have.property('message').eql("My name is Jackee");
                done();
            }).catch(done)
        })
    })
})

describe('/DELETE/:messageid', () => {
    it('it should delete message with given ID', (done) => {
        let msg = new Messages({
            id: "24883",
            message: "My name is Jackee"
        })
        msg.save((err, msg) => {
            chai.request(server)
            .delete('/delete/' + msg.id)
            .then((res) => {
                should.exist(res);
                res.should.have.status(200);
                res.should.be.a('object');
                res.body.should.have.property('success');
                res.body.should.have.property('success').eql('message was deleted');
                done();
            }).catch(done)
        })
    })
})
})