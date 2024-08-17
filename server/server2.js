const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'service.proto');

// Load gRPC package definition
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const grpcObject = grpc.loadPackageDefinition(packageDefinition);
const greeterProto = grpcObject.Greeter;

// Implement the SayHello method
const sayHello = (call, callback) => {
    const name = call.request.name;
    callback(null, { message: `Hello, ${name}!` });
};

// Create and start gRPC server
const server = new grpc.Server();
server.addService(greeterProto.service, { SayHello: sayHello });
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    console.log('Server2 is running on port 50051');
    server.start();
});
