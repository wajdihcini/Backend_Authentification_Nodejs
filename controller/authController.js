const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const register = async(req, res) => {
    const {first_name, last_name, email, password} = req.body;
    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    const FoundUser = await User.findOne({ email }).exec();
    if (FoundUser) {
        return res.status(409).json({ message: 'user already exists'})
    }
    
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            first_name,
            last_name,
            email,
            password: hashedPassword
        });
        await user.save();
        const accessToken = jwt.sign({
            userinfo:{
                id:user._id
            }
        }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({
            userinfo:{
                id:user._id
            }
        }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.status(201).json({ accessToken , 
            email: user.email , 
            first_name: user.first_name, 
            last_name:user.last_name
        });
};
const login = async(req, res) =>{
    const { email, password} = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    const FoundUser = await User.findOne({ email }).exec();
    if (!FoundUser) {
        return res.status(409).json({ message: 'user not found'})
    }
    
    const match = await bcrypt.compare(password, FoundUser.password);
    if(!match){ return res.status(401).json({ message: 'Invalid password' }) }
        
        
    const accessToken = jwt.sign({
            userinfo:{
                id:FoundUser._id
            }
        }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({
            userinfo:{
                id:FoundUser._id
            }
        }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.status(201).json({ accessToken , 
            email: FoundUser.email , 
            
        });

};
const refresh = async(req, res) => {
    const cookies = req.cookies;
    if(!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' });
    const refreshToken = cookies.jwt;

    let decoded;
    try {
        decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    const FoundUser = await User.findOne({ _id: decoded.userinfo.id }).exec();
    if(!FoundUser) return res.status(401).json({ message: 'Unauthorized' });

    const accessToken = jwt.sign({
        userinfo:{
            id:FoundUser._id
        }
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

    res.json({ accessToken });
};
const logout = async(req, res) => {
    const cookies = req.cookies;
    if(!cookies?.jwt) return res.status(204).json({ message: 'No content' });
    res.clearCookie('jwt', { httpOnly: true, secure: true, sameSite: 'None' });
    res.json({ message: 'Cookie cleared' });
};
module.exports = {
    register,
    login,
    refresh,
    logout
}