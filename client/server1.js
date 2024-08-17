const express = require('express');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'service.proto');
const app = express();
const PORT = 3000;

// Load gRPC package definition
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const grpcObject = grpc.loadPackageDefinition(packageDefinition);
const greeterProto = grpcObject.Greeter;

// Create gRPC client
const client = new greeterProto('localhost:50051', grpc.credentials.createInsecure());

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

app.listen(PORT, () => {
  console.log(`Server1 is running on http://localhost:${PORT}`);
});
