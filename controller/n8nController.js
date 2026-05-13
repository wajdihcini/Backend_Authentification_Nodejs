const axios = require('axios');
const FormData = require('form-data');

// @desc    Proxy chatbot messages to n8n webhook
// @route   POST /n8n/chat
// @access  Private (JWT required)
const handleChatbot = async (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ message: 'Message field is required' });
    }

    console.log(`[n8n/chat] Forwarding message to: ${process.env.N8N_CHATBOT_WEBHOOK_URL}`);

    try {
        const response = await axios.post(
            process.env.N8N_CHATBOT_WEBHOOK_URL,
            {
                message,
                user: req.user, // user ID from JWT middleware
                ...req.body     // forward any additional fields
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 300000 // 5 min timeout for LLM responses
            }
        );
        console.log(`[n8n/chat] Success - status ${response.status}`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('[n8n/chat] ERROR:', error.code || error.message);
        if (error.response) {
            console.error('[n8n/chat] Response status:', error.response.status);
            console.error('[n8n/chat] Response data:', JSON.stringify(error.response.data));
        }
        const status = error.response?.status || 500;
        const data = error.response?.data || { message: 'Failed to reach n8n chatbot webhook', detail: error.code || error.message };
        res.status(status).json({ error: data });
    }
};

// @desc    Proxy file uploads to n8n webhook
// @route   POST /n8n/upload
// @access  Private (JWT required)
const handleFileUpload = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded. Use field name "file".' });
    }

    try {
        const form = new FormData();
        form.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });
        // Forward the authenticated user ID
        form.append('user', req.user);
        // Forward any extra body fields (e.g. description, tags)
        if (req.body) {
            Object.keys(req.body).forEach(key => {
                form.append(key, req.body[key]);
            });
        }

        const response = await axios.post(
            process.env.N8N_UPLOAD_WEBHOOK_URL,
            form,
            {
                headers: { ...form.getHeaders() },
                timeout: 120000, // 2 min timeout for file processing
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );

        res.status(200).json(response.data);
    } catch (error) {
        console.error('n8n Upload Error:', error.message);
        const status = error.response?.status || 500;
        const data = error.response?.data || { message: 'Failed to reach n8n upload webhook' };
        res.status(status).json({ error: data });
    }
};

module.exports = { handleChatbot, handleFileUpload };
