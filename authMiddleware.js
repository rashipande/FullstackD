const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'No token' });

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.userId = payload.id;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};