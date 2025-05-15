// Backend (server.js)
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const mammoth = require('mammoth');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pdfParse = require('pdf-parse'); // Import pdf-parse

const app = express();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

fs.mkdir('uploads', { recursive: true }).catch(console.error);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));


// Document processing endpoint
app.post('/api/process-documents', upload.array('documents'), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }
        console.log('req.files:', req.files);

        const processedDocuments = await Promise.all(
            req.files.map(async (file) => {
                const content = await extractTextFromFile(file);
                return {
                    id: file.filename,
                    name: file.originalname,
                    type: file.mimetype,
                    size: file.size,
                    content,
                    summary: await generateSummary(content)
                };
            })
        );

        res.json(processedDocuments);
    } catch (error) {
        console.error('Document processing error:', error);
        res.status(500).json({ error: 'Failed to process documents', details: error.message });
    }
});

// Helper function to extract text from different file types
async function extractTextFromFile(file) {
    const ext = path.extname(file.originalname).toLowerCase();

    if (ext === '.pdf') {
        try {
            const pdfBuffer = await fs.readFile(file.path);
            const pdfData = await pdfParse(pdfBuffer);
            const text = pdfData.text;
            console.log(`PDF Text: ${text.substring(0, 200)}...`);
            return text;
        } catch (error) {
            console.error('Error extracting text from PDF:', error);
            return 'Could not extract text from PDF';
        }
    } else if (ext === '.docx') {
        try {
            const result = await mammoth.extractRawText({ path: file.path });
            console.log(`DOCX Text: ${result.value.substring(0, 200)}...`);
            return result.value;
        } catch (error) {
            console.error('Error extracting text from DOCX:', error);
            return 'Could not extract text from DOCX';
        }
    } else if (ext === '.txt') {
        try {
            const text = await fs.readFile(file.path, 'utf8');
            console.log(`TXT Text: ${text.substring(0, 200)}...`);
            return text;
        } catch (error) {
            console.error('Error reading text file:', error);
            return 'Could not read text file';
        }
    }
    throw new Error('Unsupported file type');
}

// Helper function to generate initial summary
async function generateSummary(content) {
    console.log('Content being summarized:', content);
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'Generate a concise 2-3 sentence summary of the following document. Focus on key points and legal implications.'
                    },
                    {
                        role: 'user',
                        content: content.substring(0, 10000)
                    }
                ],
                temperature: 0.3
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Summary generation error:', error.response?.data || error.message);
        return 'Could not generate summary';
    }
}

// Modified chat endpoint to include document context
app.post('/api/chat', async (req, res) => {
    try {
        const { messages, model = 'gpt-4', documentContext = [] } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Invalid messages format' });
        }

        let systemMessage = {
            role: 'system',
            content: 'You are a knowledgeable legal AI assistant. Provide accurate, concise legal information. ' +
                'When unsure, recommend consulting an attorney. Always cite relevant laws when possible.'
        };

        if (documentContext.length > 0) {
            const docContextStr = documentContext.map(doc =>
                `DOCUMENT: ${doc.name}\nCONTENT:\n${doc.content.substring(0, 5000)}...`
            ).join('\n\n');

            systemMessage.content += `\n\nHere are the documents the user has provided for context:\n${docContextStr}`;
        }

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model,
                messages: [systemMessage, ...messages.filter(m => m.role !== 'system')],
                temperature: 0.7,
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const assistantMessage = response.data.choices[0].message.content;

        res.json({
            id: Date.now().toString(),
            role: 'assistant',
            content: assistantMessage,
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Server Error:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Internal server error',
            details: error.response?.data?.error?.message || error.message
        });
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Legal AI Backend running on port ${PORT}`);
});
