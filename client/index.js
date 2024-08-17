const express = require('express');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'server.proto');
const app = express();
app.use(express.json());
const PORT = 3500;

// Load gRPC package definition
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const grpcObject = grpc.loadPackageDefinition(packageDefinition);
const UserProto = grpcObject.UserService;

// Create gRPC client
const client = new UserProto('localhost:50055', grpc.credentials.createInsecure());

// Define an endpoint to make a gRPC call
app.get('/say-hello/:name', (req, res) => {
    const name = req.params.name;
    client.SayHello({ name }, (error, response) => {
        if (error) {
            res.status(500).send('Error: ' + error.message);
        } else {
            res.send(response.message);
        }
    });
});

// // create User
app.post('/create', (req, res, next) => {
    console.log("aaa", req.body);

    const { name, email } = req.body;
    console.log("before create", name, email);

    client.Create({ name, email }, (error, response) => {
        if (error) {
            next(error)
        } else {
            console.log("after createdd", response);

            res.send(response);
        }
    });
})

// // get users
app.get('/users', (req, res, next) => {
    client.FindAll({}, (error, response) => {
        if (error) {
            next(error)
        } else {
            res.send(response);
        }
    });
})

// // find one user
app.get("/user/:id", (req, res, next) => {
    const id = req.params.id;
    client.FindOne({ id }, (error, response) => {
        if (error) {
            console.log("findOne error", error);
            res.status(500).send(error.message)
        } else {
            console.log("findOne res", response);

            res.send(response);
        }
    })
});

app.get("/", (req, res) => {
    res.send("Hello World!");
})



app.listen(PORT, () => {
    console.log(`Server1 is running on http://localhost:${PORT}`);
});
