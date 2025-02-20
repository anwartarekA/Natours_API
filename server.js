process.on('uncaughtException', (err) => {
  console.log('ERROR🔥', err.name, err.message);
  console.log('Uncaughted Exceptions founded!');
  process.exit(1);
});
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
// cconnect to database
const mongoose = require('mongoose');
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    // console.log(con.connections);
    console.log('connected to DB successfully....');
  });
const app = require('./app');
let port = 3000 || process.env.PORT;
let server = app.listen(port, '127.0.0.1', () => {
  console.log('Server is starting.....');
});
process.on('unhandledRejection', function (err) {
  console.log('ERROR🔥', err.name, err.message);
  console.log('Unhandeled Rejections Promises founded!');
  // give server time to finish pending requests and also handled requests and after it crash the server
  server.close(() => {
    process.exit(1);
  });
});
