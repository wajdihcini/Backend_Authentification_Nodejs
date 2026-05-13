const express = require('express');
const router = express.Router();
const n8nController = require('../controller/n8nController');
const verifyJWT = require('../middleware/verifyJWT');
const multer = require('multer');

// Store files in memory buffer for forwarding to n8n
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB max
});

// All routes below require a valid JWT access token
router.use(verifyJWT);

// POST /n8n/chat   - Forward a chat message to n8n chatbot webhook
router.post('/chat', n8nController.handleChatbot);

// POST /n8n/upload - Forward a file upload to n8n document processing webhook
router.post('/upload', upload.single('file'), n8nController.handleFileUpload);

module.exports = router;
