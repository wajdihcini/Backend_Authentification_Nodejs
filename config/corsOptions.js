const alloowedOrigins = require('./allowedOrigins') ;

const corsOptions = {
    origin: (origin, callback) => {
        // Check if the origin is in the allowed origins list or if it's a non-browser request (no origin)
        if (alloowedOrigins.indexOf(origin) !== -1 || !origin //this should be deleted in production mode) {

        )
        {
            callback(null, true);
        } else {
            // If the origin is not allowed, return an error 
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true , 
    optionSuccessStatus: 200, 
};

module.exports = corsOptions; 