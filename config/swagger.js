const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Auth & n8n Proxy API',
            version: '1.0.0',
            description: 'Node.js REST API with JWT authentication and n8n webhook proxy endpoints',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 5000}`,
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter the access token obtained from /auth/login',
                },
            },
            schemas: {
                // ── Auth Schemas ──
                RegisterRequest: {
                    type: 'object',
                    required: ['first_name', 'last_name', 'email', 'password'],
                    properties: {
                        first_name: { type: 'string', example: 'Wajdi' },
                        last_name:  { type: 'string', example: 'Hcini' },
                        email:      { type: 'string', format: 'email', example: 'wajdi@example.com' },
                        password:   { type: 'string', format: 'password', example: 'mySecurePassword123' },
                    },
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email:    { type: 'string', format: 'email', example: 'wajdi@example.com' },
                        password: { type: 'string', format: 'password', example: 'mySecurePassword123' },
                    },
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        accessToken: { type: 'string', description: 'JWT access token' },
                        email:       { type: 'string' },
                        first_name:  { type: 'string' },
                        last_name:   { type: 'string' },
                    },
                },
                // ── n8n Schemas ──
                ChatRequest: {
                    type: 'object',
                    required: ['message'],
                    properties: {
                        message: { type: 'string', example: 'Hello, tell me about Nabeul region' },
                    },
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        error:   { type: 'string' },
                    },
                },
            },
        },
        // ── Tag grouping ──
        tags: [
            { name: 'Auth',    description: 'Authentication endpoints (register, login, refresh, logout)' },
            { name: 'Users',   description: 'User management' },
            { name: 'n8n',     description: 'n8n webhook proxy endpoints (JWT protected)' },
        ],
        // ── Path definitions ──
        paths: {
            // ════════════════════════════════════════
            //  AUTH
            // ════════════════════════════════════════
            '/auth/register': {
                post: {
                    tags: ['Auth'],
                    summary: 'Register a new user',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/RegisterRequest' },
                            },
                        },
                    },
                    responses: {
                        201: {
                            description: 'User registered successfully',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
                        },
                        400: { description: 'Missing required fields' },
                        409: { description: 'User already exists' },
                    },
                },
            },
            '/auth/login': {
                post: {
                    tags: ['Auth'],
                    summary: 'Login and receive access + refresh tokens',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/LoginRequest' },
                            },
                        },
                    },
                    responses: {
                        201: {
                            description: 'Login successful',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
                        },
                        400: { description: 'Missing required fields' },
                        401: { description: 'Invalid password' },
                        409: { description: 'User not found' },
                    },
                },
            },
            '/auth/refresh': {
                get: {
                    tags: ['Auth'],
                    summary: 'Refresh the access token using the refresh cookie',
                    description: 'Uses the httpOnly jwt cookie to issue a new access token',
                    responses: {
                        200: {
                            description: 'New access token',
                            content: { 'application/json': { schema: { type: 'object', properties: { accessToken: { type: 'string' } } } } },
                        },
                        401: { description: 'No refresh cookie present' },
                        403: { description: 'Invalid or expired refresh token' },
                    },
                },
            },
            '/auth/logout': {
                post: {
                    tags: ['Auth'],
                    summary: 'Logout and clear the refresh cookie',
                    responses: {
                        200: { description: 'Cookie cleared' },
                        204: { description: 'No cookie to clear' },
                    },
                },
            },
            // ════════════════════════════════════════
            //  N8N PROXY
            // ════════════════════════════════════════
            '/n8n/chat': {
                post: {
                    tags: ['n8n'],
                    summary: 'Send a chat message to the n8n chatbot webhook',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ChatRequest' },
                            },
                        },
                    },
                    responses: {
                        200: { description: 'n8n chatbot response' },
                        400: { description: 'Message field is required' },
                        401: { description: 'Missing or invalid token' },
                        403: { description: 'Token expired or forbidden' },
                        500: { description: 'n8n webhook unreachable' },
                    },
                },
            },
            '/n8n/upload': {
                post: {
                    tags: ['n8n'],
                    summary: 'Upload a file to the n8n document processing webhook',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    required: ['file'],
                                    properties: {
                                        file: {
                                            type: 'string',
                                            format: 'binary',
                                            description: 'The file to upload (max 10 MB)',
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: 'n8n upload response' },
                        400: { description: 'No file uploaded' },
                        401: { description: 'Missing or invalid token' },
                        403: { description: 'Token expired or forbidden' },
                        500: { description: 'n8n webhook unreachable' },
                    },
                },
            },
        },
    },
    apis: [], // We define everything inline above, no need for file scanning
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
