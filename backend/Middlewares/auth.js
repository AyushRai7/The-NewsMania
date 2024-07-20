const jwt = require('jsonwebtoken');

const ensureAuthenticated = (req, res, next) => {
    const auth = req.header('authorization');
    if (!auth) {
        return res.status(403)
            .json({ message: 'Unauthorized, JWT token is required.' });
    }
    try {
        const decoded = jwt.verify(auth, process.env.JWT_SECRET_KEY);
        req.user = decoded;
        next();
    } catch {
        return res.status(401)
            .json({ message: 'Unauthorized, JWT token is wrong or expired.' });
    }
};

module.exports = ensureAuthenticated;
