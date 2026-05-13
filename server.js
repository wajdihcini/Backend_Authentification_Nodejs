require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const connectDB = require('./config/db_connect');
const mongoose = require('mongoose');  
const cookieParser = require('cookie-parser');
const cors = require('cors'); 
const corsOptions = require('./config/corsOptions');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const PORT = process.env.PORT || 5000;

connectDB();

//filter the request by origin
app.use(cors(corsOptions));
//middleware to parse cookie 
app.use(cookieParser());
//middleware to parse json data in the request body tell express to accept json data in the request body and make it available in req.body
app.use(express.json());

// serve static assets from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Swagger UI - accessible at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Auth & n8n API Docs',
}));

app.use('/', require('./routes/root'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/users', require('./routes/usersRoutes'));
app.use('/n8n', require('./routes/n8nRoutes'));

app.use((req, res) => {
  res.status(404);
  if (req.accepts('html')) {
    return res.send('<h1>404 Not Found</h1><p>The requested page could not be found.</p>');
  }
  if (req.accepts('json')) {
    return res.json({ error: '404 Not Found' });
  }
  res.type('txt').send('404 Not Found');
});

mongoose.connection.once('open', ()=>{
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
});
mongoose.connection.on('error', (err) => {
    console.log('MongoDB connection error:', err);
});