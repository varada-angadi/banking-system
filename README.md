# Banking System Backend (Ledger-Based)

A robust **Node.js + Express + MongoDB** backend for a banking system that supports user authentication, account management, transactions, and a **ledger-based balance system**.

---

## Features

- User Authentication (Register, Login, Logout with JWT)
- Account Management (Create & View Accounts)
- Ledger-Based Balance Calculation
- Secure Transactions with Idempotency
- Email Notifications (Registration & Transactions)
- Token Blacklisting (Logout Security)
- MongoDB Transactions (Atomic Operations)

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT + Cookies
- **Email Service:** Nodemailer (OAuth2)
- **Security:** bcrypt, token blacklist

## Project Structure
├── controllers/  
├── middleware/  
├── models/  
├── routes/  
├── services/  
├── app.js  
├── db.js  

---

## Installation

```bash
git clone https://github.com/your-username/banking-system.git
cd banking-system
npm install
Environment Variables
```

### Create a .env file
```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
EMAIL_USER=your_email
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
REFRESH_TOKEN=your_refresh_token
```
### Run the Server
```
npm start
```
