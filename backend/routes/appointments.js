const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

// Route for booking appointments
router.post('/book', async (req, res) => {
    const { name, email, phone, date, time } = req.body;
    const appointment = new Appointment({ name, email, phone, date, time });
    await appointment.save();

    // Send confirmation email with PDF
    const transporter = nodemailer.createTransport({ /* SMTP settings */ });
    const pdfDoc = new PDFDocument();
    let buffers = [];
    
    pdfDoc.on('data', buffers.push.bind(buffers));
    pdfDoc.on('end', async () => {
        const pdfData = Buffer.concat(buffers);
        
        let mailOptions = {
            from: 'clinic@example.com',
            to: email,
            subject: 'Appointment Confirmation',
            text: `Thank you, ${name}! Your appointment is confirmed.`,
            attachments: [{
                filename: 'appointment.pdf',
                content: pdfData,
                contentType: 'application/pdf'
            }]
        };
        await transporter.sendMail(mailOptions);
    });

    pdfDoc.text(`Appointment Details\n\nName: ${name}\nDate: ${date}\nTime: ${time}`);
    pdfDoc.end();
    
    res.status(201).json({ message: 'Appointment booked and confirmation sent' });
});

module.exports = router;

