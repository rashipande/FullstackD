const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken');
const users = []; // in-memory

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  if (users.find(u => u.email === email)) return res.status(409).json({ message: 'User exists' });
  const hash = await bcrypt.hash(password, 10);
  const user = { id: Date.now().toString(), name, email, password: hash };
  users.push(user);
  const token = generateToken(user.id);
  res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const token = generateToken(user.id);
  res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
};

exports.me = async (req, res) => {
  const user = users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user: { id: user.id, name: user.name, email: user.email } });
};