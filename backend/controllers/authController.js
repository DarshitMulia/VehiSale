const Jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
    try {
        const user = new User(req.body);
        const savedUser = await user.save();
        const userData = savedUser.toObject();
        delete userData.password;
        Jwt.sign({ user: userData }, process.env.JWT_SECRET, { expiresIn: "1y" }, (err, token) => {
            if (err) return res.status(500).json({ result: 'Something went wrong' });
            res.json({ user: userData, auth: token });
        });
    } catch (err) {
        res.status(500).json({ result: 'Something went wrong' });
    }
};

exports.login = async (req, res) => {
    if (req.body.email && req.body.password) {
        const user = await User.findOne(req.body).select('-password');
        if (user) {
            Jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: "1y" }, (err, token) => {
                if (err) return res.json({ result: 'Something went wrong' });
                res.json({ user, auth: token });
            });
        } else {
            res.json({ result: 'No User Found' });
        }
    } else {
        res.json({ result: 'No User Found' });
    }
};
