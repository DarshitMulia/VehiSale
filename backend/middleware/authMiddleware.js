const Jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    let token = req.headers['authorization'];
    if (token) {
        token = token.split(' ')[1];
        Jwt.verify(token, process.env.JWT_SECRET, (err, valid) => {
            if (err) {
                return res.status(401).json({ result: 'Please provide valid token' });
            }
            req.valid = valid;
            next();
        });
    } else {
        res.status(403).json({ result: 'Please add token with header' });
    }
};
