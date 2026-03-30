require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
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

app.post('/api/analyze', upload.single('resume'), async (req, res) => {
  try {
    const { mode, roastLevel, targetRole, linkedinUrl } = req.body;
    let resumeText = '';

    if (req.file) {
      if (req.file.mimetype === 'application/pdf') {
        const data = await pdfParse(req.file.buffer);
        resumeText = data.text;
      } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const data = await mammoth.extractRawText({ buffer: req.file.buffer });
        resumeText = data.value;
      } else {
        return res.status(400).json({ error: "Unsupported file type. Please upload PDF or DOCX." });
      }
    } else if (linkedinUrl) {
      resumeText = `LinkedIn URL provided: ${linkedinUrl}. Please review the overall profile logic if LinkedIn scraping isn't implemented.`;
    }

    if (!resumeText && !linkedinUrl) {
      return res.status(400).json({ error: "Please provide a resume file or LinkedIn URL." });
    }

    const result = await generateAnalysis({ resumeText, mode, roastLevel, targetRole, linkedinUrl });
    res.json(result);
  } catch (error) {
    console.error('Error analyzing resume:', error);
    res.status(500).json({ error: 'Failed to analyze resume. ' + error.message });
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
    res.status(500).json({ error: 'Failed to fix resume. ' + error.message });
  }
});

// app.listen(port, () => {
//   console.log(`HireMeOrRoastMe backend running on port ${port}`);
// });

module.exports = app;
