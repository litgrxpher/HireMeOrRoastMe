require('dotenv').config({ path: './.env' });
const { generateAnalysis } = require('./geminiService');

async function testGemini() {
    console.log("Testing Gemini with model:", process.env.GEMINI_MODEL || 'gemini-3-flash-preview');
    try {
        const result = await generateAnalysis({
            resumeText: "Software Engineer with 5 years of experience in React and Node.js.",
            mode: "Roast",
            roastLevel: "Medium",
            targetRole: "Senior Frontend Developer"
        });
        console.log("Success! Response received:");
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Test failed:", error.message);
        process.exit(1);
    }
}

testGemini();
