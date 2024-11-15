const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
require('dotenv').config();

const app = express();
const PORT = 3001;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Middleware to parse the incoming form data
app.use(bodyParser.urlencoded({ extended: true }));  // for form data
app.use(bodyParser.json());  // for JSON data (if necessary)

// Test route to check if the server is up
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/contact-form.html");  // Serve your HTML form
});

// Nodemailer transporter setup for Gmail
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,  // Your Gmail email
        pass: process.env.PASSWORD,  // Your Gmail app password
    },
});

// POST route to handle sending emails
app.post("/send-email", async (req, res) => {
    const { senderEmail, recipients, subject, message } = req.body;

    console.log("Request Body:", req.body);  // Log the incoming request body

    try {
        // Validate senderEmail (ensure it's coming from a real email address)
        if (!senderEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)) {
            return res.status(400).send("Invalid sender email.");
        }

        // Validate recipients (check if recipients are not empty)
        if (!recipients) {
            return res.status(400).send("Recipient(s) email is required.");
        }

        // Split multiple recipients by commas and clean up whitespace
        const recipientList = recipients.split(",").map((email) => email.trim());

        // Define mailOptions
        const mailOptions = {
            from: senderEmail,  // Gmail address (your email)
            to: recipientList,        // Recipients list from the form
            subject: subject,
            text: message,
            replyTo: senderEmail,     // The sender's email address (from the form)
        };

        // Send email
        await transporter.sendMail(mailOptions);
        res.status(200).send("Email sent successfully!");
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).send("Failed to send email.");
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
