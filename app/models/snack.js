// import dependencies
const mongoose = require('mongoose')

// snack is a subdocument NOT A MODEL
// snack will be part of the snacks array added to specific reptiles

// we dont, DO NOT, need to get the model from mongoose, so we're going to save a lil real estate in our file and skip destructuring, in favor of the regular syntax
const snackSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    isAlive: {
        type: Boolean,
        default: false,
        required: true
    },
    condition: {
        type: String,
        // here we're going to use enum, which means we can only use specific strings to satisfy this field.
        // enum is a validator on the type String, that says "you can only use one of these values"
        enum: ['loves', 'likes', 'edible'],
        default: 'likes'
    }
}, {
    timestamps: true
})

module.exports = snackSchema