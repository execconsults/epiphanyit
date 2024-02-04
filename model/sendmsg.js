// Create a Mongoose schema
const mongoose = require('mongoose')

  
const sendSchema = new mongoose.Schema({
      firstname: {
        type: String,
        required: true,
      },
      lastname: {
        type: String,
        required: true,
      },
      email: String,
      number: {
        type: String,
        required: true,
      },
      message: String,
});

// Create a Mongoose model
const sendmsg = mongoose.model('sendmsg', sendSchema);

module.exports = sendmsg
