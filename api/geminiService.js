const apiKey = process.env.GEMINI_API_KEY;

const systemInstruction = `
You are an expert tech recruiter and a hilarious comedy roaster, wrapped into one AI.
You've been asked to review a candidate's resume or LinkedIn profile for a specific role: {{targetRole}}.

Depending on the requested \`mode\`, you will provide either a Professional Review, a Savage Roast, or Both.

### PROFESSIONAL MODE GOALS:
- Be the "Hard Truth" recruiter. 
- Focus on **measurable impact** (numbers, %, $). If they don't have them, tell them EXACTLY where to add them.
- Identify "Skill Gaps" specifically for the target role.
- Be constructive but extremely direct. No fluff.

### SAVAGE ROAST GOALS:
- Be the "Internet Troll" version of a senior engineer.
- Use wit, sarcasm, and hyperbole. 
- Intensity is set by \`roastLevel\`:
  - **Light**: Playful teasing, like a friend roasting you at a bar.
  - **Medium**: Sharp, witty burns that actually point out career flaws.
  - **Brutal**: No mercy. Dismantle their entire professional existence. Pure entertainment.

Return ONLY a valid JSON object following this EXACT schema. No markdown, no explanation, just raw JSON:
{
  "professional": {
    "overallImpression": "string",
    "selfPerception": "string — what the candidate likely thinks their profile communicates (1-2 sentences)",
    "recruiterPerception": "string — what recruiters actually read and think when they see this resume (1-2 sentences, be direct)",
    "strengths": ["string"],
    "weaknesses": ["string"],
    "missingSkills": ["string — specific skills missing for the target role"],
    "careerDistance": "string — e.g. '~2 years from a Senior role if you add X and Y'",
    "suggestedSkills": ["string"],
    "fixedResumeBullets": ["string — 3 rewritten bullet points from their experience, with metrics and impact added. Format: [Original] -> [Improved]"],
    "resumeScore": 0,
    "hireabilityScore": 0
  },
  "roast": {
    "openingPunchline": "string",
    "experienceRoast": "string",
    "skillsRoast": "string",
    "buzzwordRoast": "string",
    "realityCheck": "string",
    "personalityType": "one of: Buzzword Ninja | Overconfident Generalist | Underrated Builder | Corporate Climber | The Eternal Intern | The Stack Overflow Hero | LinkedIn Philosopher",
    "personalityDescription": "string — a 1-sentence witty description of what that personality type means for this person",
    "vibeScore": 0,
    "buzzwordDensity": 0,
    "substanceDensity": 0
  }
}

Rules:
- resumeScore and hireabilityScore must be integers between 0-100.
- vibeScore, buzzwordDensity, substanceDensity must be integers between 0-100.
- If mode is 'Professional', roast can be null. If mode is 'Roast', professional can be null.
- Never use offensive slurs or hate speech. Keep it focused on their career/skills.
`;

const fixResumeInstruction = `
You are a world-class resume writer and career coach.
Given a resume or profile text, rewrite it to be dramatically better.
Focus on: adding measurable metrics, removing buzzwords, showing real impact.

Return ONLY a valid JSON object:
{
  "rewrittenSummary": "string — rewritten professional summary (2-3 sentences, punchy, metric-driven)",
  "rewrittenBullets": [
    "string — rewritten bullet point 1 with metric",
    "string — rewritten bullet point 2 with metric",
    "string — rewritten bullet point 3 with metric",
    "string — rewritten bullet point 4 with metric",
    "string — rewritten bullet point 5 with metric"
  ],
  "removedBuzzwords": ["string — buzzwords removed or replaced"],
  "addedImpact": "string — overall note on what was improved"
}
`;

const https = require('https');

async function generateAnalysis(params) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey === 'your_api_key_here') {
        throw new Error("GEMINI_API_KEY is not set. Get a free key at https://aistudio.google.com/app/apikey and add it to your .env file or Vercel environment variables.");
    }
    const { resumeText, mode, roastLevel, targetRole, linkedinUrl, profileText } = params;

    console.log(`Starting analysis for role: ${targetRole}, mode: ${mode}`);

    let prompt = `Target Role: ${targetRole || 'Any'}\n`;
    prompt += `Mode: ${mode}\n`;
    if (mode !== 'Professional') {
        prompt += `Roast Intensity: ${roastLevel || 'Medium'}\n`;
    }
    prompt += `\nCANDIDATE DATA:\n${profileText || resumeText || linkedinUrl}`;

    // Inject targetRole into the systemInstruction if needed
    const finalSystemInstruction = systemInstruction.replace('{{targetRole}}', targetRole || 'a tech professional');

    return callGemini(prompt, finalSystemInstruction);
}

async function fixResume(params) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey === 'your_api_key_here') {
        throw new Error("GEMINI_API_KEY environment variable is not correctly set.");
    }
    const { resumeText, targetRole } = params;
    console.log(`Starting resume fix for role: ${targetRole}`);
    const prompt = `Rewrite this resume/profile for a ${targetRole || 'tech professional'}:\n\n${resumeText}`;
    return callGemini(prompt, fixResumeInstruction);
}

async function callGemini(prompt, instruction) {
    const apiKey = process.env.GEMINI_API_KEY;
    return new Promise((resolve, reject) => {
        let model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        
        // Sanitize: Remove 'models/' prefix if user added it to the env var by mistake
        if (model.startsWith('models/')) {
            model = model.replace('models/', '');
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        const payload = JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: instruction }] },
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            },
            timeout: 60000 // Increased to 60s
        };

        console.log(`Calling Gemini API (${model}) via https module...`);
        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    let errorData;
                    try {
                        errorData = JSON.parse(data);
                    } catch (e) {
                        errorData = data;
                    }
                    console.error("Gemini API Error Response:", errorData);
                    return reject(new Error(`Gemini API returned ${res.statusCode}: ${JSON.stringify(errorData)}`));
                }

                try {
                    const parsedData = JSON.parse(data);
                    if (!parsedData.candidates || parsedData.candidates.length === 0) {
                        return reject(new Error("No response generated from Gemini."));
                    }

                    const textOutput = parsedData.candidates[0].content.parts[0].text;
                    console.log("Gemini API response received successfully.");
                    
                    try {
                        resolve(JSON.parse(textOutput));
                    } catch (e) {
                        const cleaned = textOutput.replace(/^```json/m, '').replace(/```$/m, '').trim();
                        resolve(JSON.parse(cleaned));
                    }
                } catch (parseErr) {
                    reject(new Error(`Failed to parse Gemini response: ${parseErr.message}`));
                }
            });
        });

        req.on('error', (err) => {
            console.error("Gemini Request Error:", err);
            reject(err);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Gemini API request timed out after 60 seconds.'));
        });

        req.write(payload);
        req.end();
    });
}

module.exports = { generateAnalysis, fixResume };
