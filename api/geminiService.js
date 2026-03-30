const apiKey = process.env.GEMINI_API_KEY;

const systemInstruction = `
You are an expert tech recruiter and a hilarious comedy roaster, wrapped into one AI.
You've been asked to review a candidate's resume or LinkedIn profile.
Depending on the requested \`mode\`, you will provide either a Professional Review, a Savage Roast, or Both.

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
    "fixedResumeBullets": ["string — 3 rewritten bullet points from their experience, with metrics and impact added"],
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
- buzzwordDensity + substanceDensity should roughly equal 100.
- missingSkills should be 3-6 items.
- fixedResumeBullets should be exactly 3 items.
- If mode is 'Professional', roast can be null. If mode is 'Roast', professional can be null.
- For Savage Roast, intensity is set by roastLevel (Light, Medium, Brutal).
- Never use offensive slurs.
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

async function generateAnalysis(params) {
    if (!apiKey || apiKey === 'your_api_key_here') {
        throw new Error("GEMINI_API_KEY environment variable is not correctly set. Please check your .env file.");
    }
    const { resumeText, mode, roastLevel, targetRole, linkedinUrl } = params;

    let prompt = `Analyze this candidate targeting the role: ${targetRole || 'Any'}.\n\n`;
    prompt += `Mode Requested: ${mode}\n`;
    if (mode === 'Roast' || mode === 'Both') {
        prompt += `Roast Level: ${roastLevel}\n`;
    }
    prompt += `\nCandidate Info:\n${resumeText || linkedinUrl}`;

    return callGemini(prompt, systemInstruction);
}

async function fixResume(params) {
    if (!apiKey || apiKey === 'your_api_key_here') {
        throw new Error("GEMINI_API_KEY environment variable is not correctly set.");
    }
    const { resumeText, targetRole } = params;
    const prompt = `Rewrite this resume/profile for a ${targetRole || 'tech professional'}:\n\n${resumeText}`;
    return callGemini(prompt, fixResumeInstruction);
}

async function callGemini(prompt, instruction) {
    try {
        const model = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: instruction }] },
            generationConfig: {
                responseMimeType: "application/json"
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(JSON.stringify(errorData));
        }

        const data = await response.json();
        
        if (!data.candidates || data.candidates.length === 0) {
            throw new Error("No response generated from Gemini.");
        }

        const textOutput = data.candidates[0].content.parts[0].text;
        
        try {
            return JSON.parse(textOutput);
        } catch (e) {
            const cleaned = textOutput.replace(/^```json/m, '').replace(/```$/m, '').trim();
            return JSON.parse(cleaned);
        }
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
}

module.exports = { generateAnalysis, fixResume };
