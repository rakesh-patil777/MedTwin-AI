const fs = require('fs');
const pdf = require('pdf-parse');
const { OpenAI } = require('openai');

// ==========================================
// 1. IN-MEMORY SESSION STORE
// ==========================================
/*
  In a real production app, this would be Redis or a Database.
  For this hackathon constraint, we map data locally by a Session ID.
*/
const sessionStore = {};

function getSession(sessionId) {
    if (!sessionStore[sessionId]) {
        sessionStore[sessionId] = {
            lastReportText: null,
            chatHistory: []
        };
    }
    return sessionStore[sessionId];
}

// ==========================================
// 2. PDF EXTRACTION
// ==========================================
async function extractTextFromPDF(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text.trim();
}

// ==========================================
// 3. AI REPORT ANALYSIS
// ==========================================
async function analyzeReport(sessionId, text) {
    const session = getSession(sessionId);
    // Overwrite the last report and clear prior history for new context
    session.lastReportText = text;
    session.chatHistory = [];

    const prompt = `
Analyze the following medical report. List all vital metrics found. For every single metric, output exactly one clean simple line matching this structure:
Your [metric] is [status]. [Optional short lifestyle advice].

Example:
Your hemoglobin is low.
Your cholesterol is high. You may need lifestyle changes.

Do not include bullet points, asterisks, bolding, or any extra conversational text. Just output the clean text lines.

Medical Report:
${text}
`;
    // Send to OpenAI processing
    return await callOpenAI([
        { role: "system", content: "You are a helpful and reassuring medical AI assistant." },
        { role: "user", content: prompt }
    ]);
}

// ==========================================
// 4. CHAT WITH MEMORY & CONTEXT
// ==========================================
async function chatResponse(sessionId, userMessage) {
    const session = getSession(sessionId);

    if (!session.lastReportText) {
        throw new Error("No report found in memory for this session. Please analyze a report first.");
    }

    // Build the payload with the system prompt, the report context, and previous chat history
    const messages = [
        { role: "system", content: `You are a helpful medical assistant. Answer concisely and reassuringly based ONLY on this medical report context: ${session.lastReportText}` }
    ];

    messages.push(...session.chatHistory);
    messages.push({ role: "user", content: userMessage });

    const aiResponseText = await callOpenAI(messages);

    // Store this exchange in memory
    session.chatHistory.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: aiResponseText }
    );

    return aiResponseText;
}

// ==========================================
// INTERNAL HELPER: AI CALLER (With Groq)
// ==========================================
async function callOpenAI(messages) {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        throw new Error("CRITICAL STARTUP ERROR: GROQ_API_KEY is completely missing from the backend .env! Please define it.");
    }

    const openai = new OpenAI({ 
        apiKey: apiKey,
        baseURL: "https://api.groq.com/openai/v1"
    });
    const response = await openai.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: messages,
        temperature: 0.3,
    });

    return response.choices[0].message.content.trim();
}

// ==========================================
// EXPORTS: Ready for any Express.js Controller
// ==========================================
module.exports = {
    extractTextFromPDF,
    analyzeReport,
    chatResponse,
    getSession // Exposed for testing/debugging
};

// ==========================================
// AUTO-TEST EXECUTION (If run directly)
// ==========================================
if (require.main === module) {
    async function runDemo() {
        console.log("\n🚀 INITIALIZING FULL AI MODULE DEMONSTRATION (WITH GROQ)...\n");

        try {
            const demoSessionId = "user_api_123";

            // Step 1
            console.log("=================== STEP 1 ===================");
            console.log("📄 Extracting Text from PDF (dummy.pdf)...");
            const extractedData = await extractTextFromPDF("dummy.pdf");
            console.log(`✅ Action Complete. Read ${extractedData.length} characters.\n`);

            // Step 2 & 4
            console.log("=================== STEP 2 & 4 ===============");
            console.log("🕵️ Analyzing the Report & Storing to Memory...");
            const analysis = await analyzeReport(demoSessionId, extractedData);
            console.log(`🤖 AI OUTPUT: \n${analysis}\n`);

            // Step 3
            console.log("=================== STEP 3 ===================");
            console.log("💬 Chat Interaction (Using context memory)...");
            const question = "What should I do about the iron?";
            console.log(`👤 User: "${question}"`);
            const chatAnswer = await chatResponse(demoSessionId, question);
            console.log(`🤖 AI: "${chatAnswer}"\n`);

            // View Storage Status
            console.log("=================== MEMORY ===================");
            console.log("🗄️ Checking Backend Session Store State:");
            console.log(JSON.stringify(getSession(demoSessionId), null, 2));
            console.log("\n✅ FULL MODULE IS READY FOR EXPRESS INTEGRATION!");

        } catch (err) {
            console.error("❌ Demo Failed:", err.message);
        }
    }

    runDemo();
}
