const sqlite3 = require('sqlite3').verbose();
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const express = require('express');
const UserService = require('./service/user.service');
const app = express();
const db = new sqlite3.Database('./mydatabase.db');

const PROTO_PATH = path.join(__dirname, 'server.proto');

// Load gRPC package definition
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const grpcObject = grpc.loadPackageDefinition(packageDefinition);
const UserProto = grpcObject.UserService;


// Implement gRPC methods

// Implement the SayHello method
const sayHello = (call, callback) => {
    const name = call.request.name;
    callback(null, { message: `Hello, ${name}!` });
};

// Implement the FindAll method
const getUsers = (call, callback) => {
    UserService.findAll()
        .then(users => {
            // Create a UsersList message
            const usersList = {
                users: users.data.map(user => ({
                    id: user.id.toString(),
                    name: user.name,
                    email: user.email
                }))
            };
            callback(null, usersList);
        })
        .catch(err => {
            callback(err, null);
        });
};

// Implement the Create method
const createUser = (call, callback) => {
    console.log("let create user by rpc", call.request);

    const { name, email } = call.request;
    UserService.create(name, email)
        .then(user => {
            callback(null, user.data);
        })
        .catch(err => {
            callback(err);
        });
};

// Implement the FindOne method
const findUserById = (call, callback) => {
    const id = call.request.id;
    UserService.findOne(id)
        .then((user) => {
            callback(null, user.data);
        })
        .catch(err => {
            callback(err);
        });

};

// Create and start gRPC server
const server = new grpc.Server();
server.addService(UserProto.service, {
    SayHello: sayHello,
    FindAll: getUsers,
    Create: createUser,
    FindOne: findUserById,
});

server.bindAsync('0.0.0.0:50055', grpc.ServerCredentials.createInsecure(), () => {
    console.log('gRPC server is running on port 50055');
    server.start();
});

// Express.js REST API

app.use(express.json());

// Basic route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Route to get all users
app.get('/users', (req, res, next) => {
    UserService.findAll()
        .then(users => {
            res.json(users);
        })
        .catch(next);
});

// Route to add a new user
app.post('/users', (req, res, next) => {

    const { name, email } = req.body;
    console.log("name and email", name, email);

    UserService.create(name, email)
        .then(user => {
            res.json(user);
        })
        .catch(next);
});

// Route to get a user by ID
app.get('/users/:id', (req, res, next) => {
    const id = req.params.id;
    UserService.findOne(id)
        .then(user => {
            res.json(user);
        })
        .catch(next);
});

app.listen(9000, () => {
    console.log('REST Server is running on port 9000');
});
