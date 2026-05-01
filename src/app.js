const express = require("express")
const cookieParser = require("cookie-parser")

const app = express()

app.use(express.json())
app.use(cookieParser())

/**
 *  - Routes required
 */
const accountRouter = require("./routes/account.route")
const authRouter = require("./routes/auth.routes")
const transactionRouter = require("./routes/transaction.route") 

/**
 *  - Use Routes
 */
app.use("/api/auth", authRouter)
app.use("/api/accounts", accountRouter)
app.use("/api/transactions", transactionRouter)


module.exports = app