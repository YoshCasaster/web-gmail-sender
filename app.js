require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const app = express();
const rateLimit = require('express-rate-limit');

// Batasan pengiriman email
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 50, // maksimal 50 email per 15 menit
  message: 'Terlalu banyak permintaan pengiriman email, coba lagi nanti'
});

// Konfigurasi transporter email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routes
// Perbaikan route landing page
app.get('/', (req, res) => {
    res.render('landing', { title: 'Email Sender - Kirim Email dengan Mudah' });
  });
  
  // Perbaikan route dashboard
  app.get('/dashboard', (req, res) => {
    res.render('dashboard', { title: 'Dashboard - Email Sender' });
  });

app.post('/send-email', emailLimiter, async (req, res) => {
  try {
    const { recipients, subject, message, template, duration } = req.body;
    
    // Validasi input
    if (!recipients || !subject || !message) {
      return res.status(400).json({ error: 'Semua field harus diisi' });
    }
    
    const recipientList = recipients.split(',').map(email => email.trim());
    
    // Delay pengiriman sesuai durasi yang dipilih
    const delay = parseInt(duration) || 0;
    
    // Kirim email ke setiap penerima
    for (const email of recipientList) {
      let htmlContent = message;
      
      // Gunakan template jika dipilih
      if (template && ['1', '2', '3'].includes(template)) {
        htmlContent = require('fs').readFileSync(
          path.join(__dirname, 'public', 'templates', `template${template}.html`), 
          'utf8'
        );
        htmlContent = htmlContent.replace('{{message}}', message);
      }
      
      const mailOptions = {
        from: `"${process.env.GMAIL_NAME}" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: subject,
        html: htmlContent
      };
      
      await new Promise(resolve => setTimeout(resolve, delay * 1000));
      await transporter.sendMail(mailOptions);
    }
    
    res.json({ success: true, message: 'Email berhasil dikirim' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengirim email' });
  }
});

// Server listening
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;