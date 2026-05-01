const nodemailer = require('nodemailer');
const accountModel = require("../models/account.model")

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
    },
});

// Verify the connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Error connecting to email server:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});


// Function to send email
const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Banking System" <${process.env.EMAIL_USER}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            text, // plain text body
            html, // html body
        });

        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending email:', error);
    }
};


async function sendRegistrationEmail(userEmail, name) {
    const subject = 'Welcome to Backend Ledger!';
    const text = `Hello ${name},\n\nThank you for registering at Bank system. We're excited to have you on board!\n\nBest regards,\nThe Bank system Team`;
    const html = `<p>Hello ${name},</p><p>Thank you for registering at Bank system. We're excited to have you on board!</p><p>Best regards,<br>The Bank system Team</p>`;

    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, name, amount, toAccount) {
    const toUser = await accountModel.findOne({
        _id: toAccount
    }).populate("user", "name");
    const subject = 'Transaction Successfull!';
    const text = `Hello ${name},\n\nA transaction of ${amount} has been made from your account to account ${toUser.user.name}.\n\nBest regards,\nThe Bank system Team`;
    const html = `<p>Hello ${name},</p><p>A transaction of ${amount} has been made from your account to account ${toUser.user.name}.</p><p>Best regards,<br>The Bank system Team</p>`;

    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(userEmail, name, amount, toAccount) {
    const toUser = await accountModel.findOne({
        _id: toAccount
    }).populate("user", "name");
    const subject = 'Transaction Failed!';
    const text = `Hello ${name},\n\nA transaction of $${amount} to account ${toUser.user.name} has failed. Please check your account balance and try again.\n\nBest regards,\nThe Bank system Team`;
    const html = `<p>Hello ${name},</p><p>A transaction of $${amount} to account ${toUser.user.name} has failed. Please check your account balance and try again.</p><p>Best regards,<br>The Bank system Team</p>`;

    await sendEmail(userEmail, subject, text, html);
}

module.exports = {
    sendRegistrationEmail,
    sendTransactionEmail,
    sendTransactionFailureEmail,
};