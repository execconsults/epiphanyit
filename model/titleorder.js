// Create a Mongoose schema
const mongoose = require('mongoose')

  
const titleschema = new mongoose.Schema({


});

// Create a Mongoose model
const titleorder = mongoose.model('titleorder', titleschema);

module.exports = titleorder
