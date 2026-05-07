const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({ // id is automatically created by MongoDB
    first_name: {
        type: String,
        required: true,
        unique: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
},{ timestamps: true });


module.exports = mongoose.model('User', userSchema);