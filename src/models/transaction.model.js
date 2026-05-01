const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "Transaction must have a source account"],
        index: true

    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "Transaction must have a destination account"],
        index: true
    },
    amount: {
        type: Number,
        required: [true, "Transaction must have an ammount"],
        min: [0, "Transaction ammount cannot be negative"]
    },
    status: {
        type: String,
        enum: { 
            values: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
            message: "Status can be either PENDING, COMPLETED, FAILED or REVERSED"
        },
        default: "PENDING"
    },
    idempotencyKey: {
        type: String,
        unique: true,
        index: true,
        required: [true, "Transaction must have an idempotency key"]
    }
},{
    timestamps: true
})

const transactionModel = mongoose.model("transaction", transactionSchema)
module.exports = transactionModel