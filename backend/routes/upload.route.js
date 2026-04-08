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
dotenv.config(); // Triggered restart hook explicitly!

// Initialize Groq client securely
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "gsk_dummy" });

router.post('/', upload.single('document'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Please upload a valid PDF file.' });
  
  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    const extractedData = await pdfParse(dataBuffer);
    const reportText = extractedData.text;

    // --- HACKATHON MEMORY SYSTEM --- 
    // Secure the uploaded text globally in RAM for the Chatbot to reference!
    global.latestReportContext = reportText.substring(0, 3000); 

    // PROMPT ENGINEERED FOR MEDICAL PARSING
    const prompt = `
      I have extracted the following text from a patient's medical report:
      
      "${reportText.substring(0, 5000)}" 
      
      Please carefully analyze ALL the vital metrics presented in the report. 
      For every single important metric found, provide a 1-line simple explanation.
      You must match this exact format strictly for each metric:
      
      Your [metric] is [status], which may require [action / no action].

      Example output:
      Your hemoglobin level is normal.
      Your cholesterol is slightly high, which may require lifestyle changes.
      Your blood sugar is elevated, which may require dietary adjustments.
      
      List all the details and metrics found. Do not include any extra greeting or bold text. Just output the clean list of simple sentences in plain english!
    `;

    let aiExplanation = "Groq Analysis pending: Please provide a valid GROQ_API_KEY in .env";
    
    // Check for Groq's unique API signature (gsk_)
    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.startsWith('gsk_')) {
       try {
         // Query the lightning fast Llama 3.1 model natively through Groq!
         const chatCompletion = await groq.chat.completions.create({
           messages: [{ role: "user", content: prompt }],
           model: "llama-3.1-8b-instant",
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
