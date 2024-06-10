const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator'); // Ensure express-validator is required

const app = express();
const port = 3000;

// Initialize Firebase Admin SDK with service account key
const serviceAccount = require('./capkey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.post('/signup', [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { username, email, password } = req.body;
  const normalizedEmail = email.toLowerCase();

  console.log('Received signup request:', { username, email: normalizedEmail });

  try {
    const db = admin.firestore();
    const userRef = db.collection('users').doc(normalizedEmail);
    const doc = await userRef.get();

    if (doc.exists) {
      console.log('Signup error: Email already exists');
      return res.status(400).json({ success: false, message: 'Email already exists' });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      await userRef.set({ username, email: normalizedEmail, password: hashedPassword });
      console.log('User created successfully:', { username, email: normalizedEmail });
      return res.status(201).json({ success: true, redirectUrl: '/dashboard' });
    }
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while creating user', error: error.message });
  }
});

app.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase();

  console.log('Received login request:', { email: normalizedEmail, password });

  try {
    const db = admin.firestore();
    const userRef = db.collection('users').doc(normalizedEmail);
    const doc = await userRef.get();

    if (!doc.exists) {
      console.log('Login error: User not found');
      return res.status(400).json({ success: false, message: 'User not found' });
    } else {
      const user = doc.data();
      console.log('Found user:', user);

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        console.log('User logged in successfully:', { email: normalizedEmail });
        return res.status(200).json({ success: true, message: 'Login successful', redirectUrl: '/dashboard' });
      } else {
        console.log('Login error: Incorrect password');
        return res.status(400).json({ success: false, message: 'Incorrect password' });
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'An error occurred during login', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
