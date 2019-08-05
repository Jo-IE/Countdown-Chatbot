process.env.NODE_ENV = 'test';



const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const should = chai.should();

chai.use(chaiHttp);



describe("GET/", function(){
    it("should respond with a status of 200 and send a message", function(done){
        chai.request(server)
        .get('/')
        .then((res) =>{
            should.exist(res);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('challenge');
            done();
        }).catch(done)
    })
})

describe("POST/", function(){
    it("should respond with a status of 200", function(done){
        chai.request(server)
        .post('/')
        .then((res) =>{
            should.exist(res);
            res.should.have.status(200);
            done();
        }).catch(done)
    })
})