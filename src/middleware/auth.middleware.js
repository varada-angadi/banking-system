const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const blacklistModel = require("../models/blacklist.model")

async function authMiddleware(req, res, next){
    const token = req.cookies.token || req.header.authorization?.split(" ")[1]
    if(!token){
        return res.status(401).json({
            message: "Unauthorized access, token missing"
        })
    }

    const blacklistedToken = await blacklistModel.findOne({token})
    if(blacklistedToken){
        return res.status(401).json({
            message: "Unauthorized access, token is invalid"
        })
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.userId)
        req.user = user
        return next()
    }
    catch(err){
        return res.status(401).json({
            message: "Unauthorized access, token missing"
        })
    }
}
async function authSystemUserMiddleware(req, res, next){
    const token = req.cookies.token || req.header.authorization?.split(" ")[1]
    if(!token){
        return res.status(401).json({
            message: "Unauthorized access, token missing"
        })
    }
    
    const blacklistedToken = await blacklistModel.findOne({token})
    if(blacklistedToken){
        return res.status(401).json({
            message: "Unauthorized access, token is invalid"
        })
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.userId).select("+systemUser")
        if(!user.systemUser){
            return res.status(403).json({
                message: "Forbidden access, system user only"
            })
        }
        req.user = user
        return next()
    }
    catch(err){
        return res.status(401).json({
            message: "Unauthorized access, token missing"
        })
    }
}
module.exports={
    authMiddleware,
    authSystemUserMiddleware

}