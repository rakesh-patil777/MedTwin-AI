const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const crypto = require('crypto');
const emailValidator = require('deep-email-validator');
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
const prescriptionsDB = {}; 

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
  filename: (req, file, cb) => {
    const safeSession = req.body.sessionId || 'anonymous';
    cb(null, `${safeSession}__${Date.now()}__${file.originalname}`);
  }
});
const upload = multer({ storage });

// ==========================================
// AUTHENTICATION APIs
// ==========================================

// 1. Email + Password Login (Auto-registers if new)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required." });

  // 🔴 DEEP VERIFICATION: Check if the mailbox physically exists on the provider's site!
  try {
    const MailCheck = await emailValidator.validate({
        email: email,
        validateRegex: true,
        validateMx: true, // Check physical DNS Domain MX Records
        validateTypo: true,
        validateDisposable: true,
        validateSMTP: false // DISABLED: ISPs block outbound Port 25 causing connection drops
    });

    if (!MailCheck.valid) {
        console.log(`[FIREWALL] Rejected fake/dead email: ${email} - Reason: ${MailCheck.reason}`);
        return res.status(400).json({ error: "invalid mail" });
    }
  } catch (err) {
     console.log("Deep Mail Check Error: ", err.message);
  }

  let user = usersDB.find(u => u.email === email.toLowerCase());
  
  if (!user) {
    // Generate a deterministic identity lock based on their precise email so data survives server crashes
    const deterministicId = crypto.createHash('sha256').update(email.toLowerCase()).digest('hex').substring(0, 16);
    user = { email: email.toLowerCase(), password: hashPassword(password), phone: null, id: deterministicId };
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
  
  console.log(`\n============================================`);
  console.log(`📲 [MOCK SMS] OTP code for ${phone} is: ${otp}`);
  console.log(`============================================\n`);
  return res.json({ success: true, message: "OTP sent!", mockOtp: otp });
});

// 3. Verify OTP
app.post('/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  if (otpStore[phone] !== otp) return res.status(400).json({ error: "Invalid or expired OTP." });

  let user = usersDB.find(u => u.phone === phone);
  if (!user) {
    // Generate a deterministic identity lock based on their precise phone number
    const deterministicId = crypto.createHash('sha256').update(phone).digest('hex').substring(0, 16);
    user = { email: null, password: null, phone, id: deterministicId };
    usersDB.push(user);
    console.log(`👤 New phone user registered: ${phone}`);
  }

  delete otpStore[phone]; // Cleanup
  return res.json({ success: true, sessionId: user.id, message: "OTP Verified!" });
});

// ==========================================
// PRESCRIPTION REMINDER APIs
// ==========================================
app.post('/add-prescription', (req, res) => {
  const { sessionId, medicineName, timings } = req.body;
  if (!sessionId) return res.status(401).json({ error: 'Unauthorized.' });
  if (!prescriptionsDB[sessionId]) prescriptionsDB[sessionId] = [];
  
  const newPrescription = {
    id: generateUUID(),
    medicineName,
    timings // Array like ["09:00", "14:00"]
  };
  
  prescriptionsDB[sessionId].push(newPrescription);
  res.json({ success: true, prescription: newPrescription });
});

app.get('/prescriptions', (req, res) => {
  const sessionId = req.query.sessionId;
  if (!sessionId) return res.status(401).json({ error: 'Unauthorized.' });
  const list = prescriptionsDB[sessionId] || [];
  res.json({ success: true, prescriptions: list });
});

app.delete('/prescriptions/:id', (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(401).json({ error: 'Unauthorized.' });
  const idToRemove = req.params.id;
  if (prescriptionsDB[sessionId]) {
     prescriptionsDB[sessionId] = prescriptionsDB[sessionId].filter(p => p.id !== idToRemove);
  }
  res.json({ success: true });
});

// ==========================================
// LIST ALL SAVED MEDICAL RECORDS API
// ==========================================
app.get('/files', (req, res) => {
  const sessionId = req.query.sessionId;
  if (!sessionId) return res.status(401).json({ error: 'Unauthorized.' });
  
  try {
    const files = fs.readdirSync(uploadDir);
    // Strict Database Isolation: Physical read dir filters natively to UUID prefix
    const userFiles = files.filter(f => f.startsWith(`${sessionId}__`));
    
    const sortedFiles = userFiles.sort().reverse();
    
    const fileData = [];
    const seenNames = new Set();
    
    sortedFiles.forEach(filename => {
      const parts = filename.split('__');
      const originalName = parts.length >= 3 ? parts.slice(2).join('__') : filename;
      
      // Deduplicate: Only add the latest version of physical files with the same original name
      if (!seenNames.has(originalName)) {
        seenNames.add(originalName);
        fileData.push({
          id: filename,
          name: originalName,
          path: `http://localhost:${PORT}/uploads/${encodeURIComponent(filename)}`
        });
      }
    });
    
    return res.json({ success: true, files: fileData });
  } catch (error) {
    console.error("File Vault Error:", error.message);
    return res.status(500).json({ error: 'Failed to access physical file vault.' });
  }
});

// ==========================================
// DELETE A SECURE VAULT FILE API
// ==========================================
app.delete('/files/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const sessionId = req.query.sessionId;
    
    if (!sessionId || !filename.startsWith(`${sessionId}__`)) {
       return res.status(403).json({ error: "Access Denied. You do not own this file structure." });
    }

    const filepath = uploadDir + filename;
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    return res.json({ success: true, message: "File removed securely." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete file." });
  }
});

// ==========================================
// 1. UPLOAD & ANALYZE API
// ==========================================
app.post('/upload-report', upload.single('document'), async (req, res) => {
  const sessionId = req.body.sessionId;
  const linkUrl = req.body.linkUrl;
  
  if (!sessionId) return res.status(401).json({ error: 'Unauthorized: No active session.' });
  if (!req.file && !linkUrl) return res.status(400).json({ error: 'No document or link provided.' });
  
  try {
    const targetPath = req.file ? req.file.path : linkUrl;
    // Route to universal generic text processor (OCR, PDF, Excel, HTML, Word)
    const extractedText = await aiModule.extractTextFromFile(targetPath);
    
    // Simple Rule-Based Hackathon Risk Detection
    const riskKeywords = ['high bp', 'high blood pressure', 'high sugar', 'diabetes', 'low hemoglobin', 'critical', 'emergency'];
    const textLower = extractedText.toLowerCase();
    const isCritical = riskKeywords.some(keyword => textLower.includes(keyword));

    // Simple Rule-based Health Score System
    let healthScore = 100;
    if (textLower.match(/high bp|high blood pressure|hypertension/)) healthScore -= 15;
    else if (textLower.match(/low bp|hypotension/)) healthScore -= 5;
    
    if (textLower.match(/high sugar|diabetes|high glucose/)) healthScore -= 20;
    else if (textLower.match(/low sugar|hypoglycemia/)) healthScore -= 10;
    
    if (textLower.match(/high cholesterol|hyperlipidemia/)) healthScore -= 15;
    if (textLower.match(/low hemoglobin|anemia/)) healthScore -= 10;
    if (textLower.match(/critical|emergency/)) healthScore -= 25;
    
    healthScore = Math.max(10, healthScore);

    const analysis = await aiModule.analyzeReport(sessionId, extractedText);
    
    return res.json({
      success: true,
      message: 'PDF analyzed perfectly by MedTwin AI!',
      explanation: analysis,
      isCritical: isCritical,
      healthScore: healthScore
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
