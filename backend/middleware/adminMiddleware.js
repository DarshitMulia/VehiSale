const User = require('../models/User');

exports.checkAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.valid.user._id);
        if (user && user.isAdmin) {
            req.user = user;
            next();
        } else {
            res.status(403).send('Access denied. Only admins can access this route.');
        }
    } catch (err) {
        res.status(403).send('Access denied.');
    }
};
