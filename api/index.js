require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PDFParse } = require('pdf-parse');
const mammoth = require('mammoth');
const { generateAnalysis, fixResume } = require('./geminiService');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Set up Multer for memory storage (we don't save files locally)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage, 
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV || 'production' });
});

app.post('/api/analyze', upload.single('resume'), async (req, res) => {
  try {
    const { mode, roastLevel, targetRole, linkedinUrl, profileText } = req.body;
    let resumeText = '';

    if (req.file) {
      if (req.file.mimetype === 'application/pdf') {
        const parser = new PDFParse({ data: req.file.buffer });
        try {
          const result = await parser.getText();
          resumeText = result.text;
        } finally {
          await parser.destroy();
        }
      } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const data = await mammoth.extractRawText({ buffer: req.file.buffer });
        resumeText = data.value;
      } else {
        return res.status(400).json({ error: "Unsupported file type. Please upload PDF or DOCX." });
      }
    }

    if (!resumeText && !linkedinUrl && !profileText) {
      return res.status(400).json({ error: "Please provide a resume, LinkedIn URL, or profile content." });
    }

    const finalContent = profileText || resumeText || (linkedinUrl ? `LinkedIn URL: ${linkedinUrl}` : '');

    const result = await generateAnalysis({ 
      resumeText: finalContent, 
      mode, 
      roastLevel, 
      targetRole, 
      linkedinUrl,
      profileText 
    });
    res.json(result);
  } catch (error) {
    console.error('Error analyzing resume:', error);
    res.status(500).json({ error: 'Failed to analyze resume: ' + error.message });
  }
});

app.post('/api/fix-resume', async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body;
    if (!resumeText) {
      return res.status(400).json({ error: "Please provide resume text to fix." });
    }
    const result = await fixResume({ resumeText, targetRole });
    res.json(result);
  } catch (error) {
    console.error('Error fixing resume:', error);
    res.status(500).json({ error: 'Failed to fix resume: ' + error.message });
  }
});

// On Vercel, we export the app and don't call app.listen()
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(port, '0.0.0.0', () => {
    console.log(`HireMeOrRoastMe backend running locally on port ${port}`);
  });
}

module.exports = app;
