const express = require("express")
const router = express.Router()
const transactionController = require("../controllers/transaction.controller")
const authMiddleware = require("../middleware/auth.middleware")
/**
 * - Create a new transaction   
 */
router.post("/", authMiddleware.authMiddleware, transactionController.createTransaction)

/**
 * - POST /api/transactions/system/initial-funds
 * - Create initial funds for the system account
 */
router.post("/system/initial-funds", authMiddleware.authSystemUserMiddleware, transactionController.createInitialFundsTransaction)



module.exports = router