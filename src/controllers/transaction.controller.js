const transactionModel = require("../models/transaction.model")
const ledgerModel = require("../models/ledger.model")
const emailService = require("../services/email.service")
const accountModel = require("../models/account.model")
const mongoose = require("mongoose")

/**
 * - Create a new transaction
 * -Transaction flow steps:
 * 1. Validate request
 * 2. Validate idempotency key
 * 3. Check account status
 * 4. Derive sender balance
 * 5. Create transaction(Pending)
 * 6. Create debit entry in ledger
 * 7. Create credit entry in ledger
 * 8. Mark transaction as completed
 * 9. Commit mongoDB session
 * 10. Send transaction email notification
 */
async function createTransaction(req, res){
    const {fromAccount, toAccount, amount, idempotencyKey} = req.body

    /**
     * 1. Validate request
     */
    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message: "Missing required fields"
        })
    }
    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount,
    })
    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    if(!fromUserAccount || !toUserAccount){
        return res.status(400).json({
            message: "One or both accounts not found"
        })
    }

    /**
     * 2. Validate idempotency key
     */
    const isTransactionExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    })

    if(isTransactionExists){
        if(isTransactionExists.status === "COMPLETED"){
        return res.status(200).json({
        message: "Transaction already processed",
        transaction: isTransactionExists
        })
        }
        if(isTransactionExists.status === "PENDING"){
        return res.status(409).json({
            message: "Transaction still processing"
        })
        }
        if(isTransactionExists.status === "FAILED"){
        return res.status(500).json({
            message: "Transaction failed previously, please retry"
        })
        }
        if(isTransactionExists.status === "REVERSED"){
        return res.status(500).json({
            message: "Transaction reversed previously, please retry"
        })
        }
    }

    /**
     * 3. Check account status
     */

    if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE"){
        return res.status(400).json({
            message: "One or both accounts are not active"
        })
    }

    /**
     * 4. Derive sender balance
     */

    const balance = await fromUserAccount.getBalance()
    if(balance < amount){
        return res.status(400).json({
            message: `Insufficient funds.Current balance is ${balance}. Requested amount is ${amount}`
        })
    }
    let transaction;
    const session = await mongoose.startSession()
    session.startTransaction()
    try{
    /**
     * 5. Create transaction(Pending)
     */
    transaction = (await transactionModel.create([{
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    }],{session}))[0]

    /** 
     * 6. Create debit entry in ledger
     */
    const debitLedgerEntry = await ledgerModel.create([{
        account: fromAccount,
        transaction: transaction._id,
        amount,
        type: "DEBIT"
    }], {
        session
    })

    // await (() =>{
    //     return new Promise((resolve) => setTimeout(resolve, 10 * 1000));
    // })()


    /**
     * 7. Create credit entry in ledger
     */
    const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        transaction: transaction._id, 
        amount,
        type: "CREDIT"
    }], {
        session
    })  


    /**
     * 8. Mark transaction as completed
     */

    await transactionModel.findOneAndUpdate(
        {_id: transaction._id}, 
        {status: "COMPLETED"}, 
        {session}
    )
   

    /**
     * 9. Commit mongoDB session
     */
    await session.commitTransaction()
    session.endSession()
}
catch(error){
    await session.abortTransaction(),
    session.endSession()
    return res.status(400).json({
        message: "An error occurred while creating the transaction",
        error: error
    })
}


    /**
     * 10. Send transaction email notification
     */

    emailService.sendTransactionEmail(
        req.user.email, 
        req.user.name,
        amount,
        toUserAccount._id
    )

    return res.status(201).json({
        message: "Transaction created successfully",
        transaction: transaction
    })
}

async function createInitialFundsTransaction(req, res){
    const {toAccount, amount, idempotencyKey} = req.body
    console.log(toAccount, amount, idempotencyKey)
    if(!toAccount || !amount || !idempotencyKey){
        
        return res.status(400).json({
            message: "Missing required fields"
        })
    }

    const toUserAccount = await accountModel.findOne({
        _id: toAccount
    })

    if(!toUserAccount){
        return res.status(404).json({
            message: "Recipient account not found"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        user: req.user._id
    })

    if(!fromUserAccount){
        return res.status(404).json({
            message: "System account not found"
        })
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = new transactionModel({
    fromAccount: fromUserAccount._id,
    toAccount,
    amount,
    idempotencyKey,
    status: "PENDING"
    })


    const debitLedgerEntry = await ledgerModel.create([{
        account: fromUserAccount._id,
        transaction: transaction._id,
        amount,
        type: "DEBIT"
    }], {
        session
    })

    const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        transaction: transaction._id,   
        amount,
        type: "CREDIT"
    }], {
        session
    })

    transaction.status = "COMPLETED"
    await transaction.save({session})
    await session.commitTransaction()
    session.endSession()

    return res.status(201).json({
        message: "Initial funds transaction created successfully",
        transaction: transaction
    })
}



module.exports={
    createTransaction,
    createInitialFundsTransaction
}