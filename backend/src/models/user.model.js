const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
    }
    ,profileImage: {
        type: String,
    }
    ,followingFoodPartners: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'foodpartner'
    }]
    ,likedFoodItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'food'
    }]
    ,orders: [{
        food: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'food'
        },
        status: {
            type: String,
            enum: ['placed', 'preparing', 'delivered', 'cancelled'],
            default: 'placed'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, 
    {
        timestamps: true
    }

)

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;