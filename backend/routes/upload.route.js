import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { createRequire } from 'module';
import Groq from 'groq-sdk'; // High-speed Groq inference SDK

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse'); 

const router = express.Router();

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Only PDF files are allowed!'), false);
};

const upload = multer({ storage, fileFilter });

import dotenv from 'dotenv';
dotenv.config(); // Triggered restart hook

// Initialize Groq client securely
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "gsk_dummy" });

router.post('/', upload.single('document'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Please upload a valid PDF file.' });
  
  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    const extractedData = await pdfParse(dataBuffer);
    const reportText = extractedData.text;

    // PROMPT ENGINEERED FOR MEDICAL PARSING
    const prompt = `
      You are a friendly, empathetic AI medical assistant. 
      I have extracted the following text from a patient's medical report:
      
      "${reportText.substring(0, 5000)}" 
      
      Please provide a very simple, user-friendly explanation of these results. 
      Focus on the most important numbers and tell me if they are normal or require attention.
      Keep it short, clear, and reassuring. Do not give medical advice, just explain the data in plain english.
    `;

    let aiExplanation = "Groq Analysis pending: Please provide a valid GROQ_API_KEY in .env";
    
    // Check for Groq's unique API signature (gsk_)
    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.startsWith('gsk_')) {
       try {
         // Query the lightning fast Llama 3 model natively through Groq!
         const chatCompletion = await groq.chat.completions.create({
           messages: [{ role: "user", content: prompt }],
           model: "llama3-8b-8192",
         });
         aiExplanation = chatCompletion.choices[0]?.message?.content || "No output generated.";
       } catch (apiError) {
         aiExplanation = "❌ Groq API Error: " + apiError.message;
       }
    }

    res.json({
      success: true,
      message: 'PDF successfully processed through Groq!',
      explanation: aiExplanation,
      file: req.file
    });

  } catch (err) {
    console.error("PDF/AI Error: ", err);
    res.status(500).json({ error: 'Failed to extract text or analyze with API.' });
  }
});

export default router;
