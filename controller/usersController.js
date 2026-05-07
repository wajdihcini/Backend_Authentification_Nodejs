const user = require('../models/User');


const getALLUsers = async(req, res) => {
    const users = await user.find().select('-password').exec();
    if(!users.length){ 
        return res.status(204).json({ message: 'No users found' });
}
    res.json(users);
};

module.exports = {
    getALLUsers,
};