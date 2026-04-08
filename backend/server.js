const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();

const aiModule = require('./ai/ai-module.js');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// HACKATHON IN-MEMORY DB 
// ==========================================
// In a real app we would use MongoDB here.
const usersDB = []; 
const otpStore = {}; 

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}
function generateUUID() {
  return crypto.randomUUID();
}

// ==========================================
// API KEY VERIFICATION
// ==========================================
if (process.env.GROQ_API_KEY) {
  console.log("✅ GROQ_API_KEY is successfully loaded from .env");
} else {
  console.warn("⚠️ WARNING: GROQ_API_KEY is missing in .env!");
}

app.use(cors());
app.use(express.json());

// ==========================================
// SERVER HEARTBEAT API
// ==========================================
app.get('/test', (req, res) => {
  return res.json({ message: 'Server is online!' });
});

// ==========================================
// MULTER CONFIGURATION & STATIC FILE SERVER
// ==========================================
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Allow the React frontend to download/view the PDFs
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// ==========================================
// AUTHENTICATION APIs
// ==========================================

// 1. Email + Password Login (Auto-registers if new)
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required." });

  let user = usersDB.find(u => u.email === email);
  
  if (!user) {
    // Hackathon simple feature: Auto-register if not found
    user = { email, password: hashPassword(password), phone: null, id: generateUUID() };
    usersDB.push(user);
    console.log(`👤 New user registered: ${email}`);
  } else {
    // Verify hash
    if (user.password !== hashPassword(password)) {
      return res.status(401).json({ error: "Invalid password." });
    }
  }

  return res.json({ success: true, sessionId: user.id, message: "Login successful!" });
});

// 2. Send OTP
app.post('/send-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone number required." });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[phone] = otp;
  
  console.log(`\n📲 [MOCK SMS] OTP for ${phone} is: ${otp}\n`);
  return res.json({ success: true, message: "OTP sent! Check server console." });
});

// 3. Verify OTP
app.post('/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  if (otpStore[phone] !== otp) return res.status(400).json({ error: "Invalid or expired OTP." });

  let user = usersDB.find(u => u.phone === phone);
  if (!user) {
    user = { email: null, password: null, phone, id: generateUUID() };
    usersDB.push(user);
    console.log(`👤 New phone user registered: ${phone}`);
  }

  delete otpStore[phone]; // Cleanup
  return res.json({ success: true, sessionId: user.id, message: "OTP Verified!" });
});

// ==========================================
// LIST ALL SAVED MEDICAL RECORDS API
// ==========================================
app.get('/files', (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir);
    // Sort array by newest upload time first based on our Date.now() prefix
    const fileData = files.map(filename => ({
      name: filename.split('-').slice(1).join('-') || filename, // Original clean name
      path: `http://localhost:5000/uploads/${encodeURIComponent(filename)}`
    })).reverse();
    
    return res.json({ success: true, files: fileData });
  } catch (error) {
    console.error("File Vault Error:", error.message);
    return res.status(500).json({ error: 'Failed to access physical file vault.' });
  }
});

// ==========================================
// 1. UPLOAD & ANALYZE API
// ==========================================
app.post('/upload-report', upload.single('document'), async (req, res) => {
  const sessionId = req.body.sessionId;
  if (!sessionId) return res.status(401).json({ error: 'Unauthorized: No active session.' });
  if (!req.file) return res.status(400).json({ error: 'No PDF document uploaded.' });
  
  try {
    const extractedText = await aiModule.extractTextFromPDF(req.file.path);
    const analysis = await aiModule.analyzeReport(sessionId, extractedText);
    
    return res.json({
      success: true,
      message: 'PDF analyzed perfectly by MedTwin AI!',
      explanation: analysis
    });
  } catch (error) {
    console.error("Upload API Error:", error.message);
    return res.status(500).json({ error: error.message || 'Failed to process medical report' });
  }
});

// ==========================================
// 2. CHAT MEMORY API
// ==========================================
app.post('/chat', async (req, res) => {
  const { message, sessionId } = req.body;
  if (!sessionId) return res.status(401).json({ error: 'Unauthorized.' });
  if (!message) return res.status(400).json({ error: 'Message payload is required.' });

  try {
    const reply = await aiModule.chatResponse(sessionId, message);
    return res.json({
      success: true,
      reply: reply
    });
  } catch (error) {
    console.error("Chat API Error:", error.message);
    return res.status(500).json({ error: error.message || 'Failed to generate chat response.' });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 MedTwin AI Server (CommonJS) mounted on http://localhost:${PORT}`);
});
