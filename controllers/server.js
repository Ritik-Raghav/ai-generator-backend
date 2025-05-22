import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import User from '../models/user.js';

dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET_KEY;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/google/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

// Step 1: Redirect to Google Auth
const googleAuth = async (req, res) => {
  try {
    const url =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=openid%20email%20profile`;

    res.redirect(url);
  } catch (error) {
    console.error("Google Auth error:", error.message);
    res.status(500).send("Google authentication error");
  }
};

// Step 2: Callback from Google
const googleAuthCallback = async (req, res) => {
  const code = req.query.code;

  try {
    // Exchange code for tokens
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    const accessToken = tokenRes.data.access_token;

    // Fetch user profile
    const userInfoRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const { email, name, picture } = userInfoRes.data;

    // Check if user exists in MongoDB
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email, name, picture });
      await user.save();
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Redirect to frontend with JWT
    res.redirect(`${FRONTEND_URL}/?token=${token}`);
  } catch (error) {
    console.error("Auth callback error:", error.response?.data || error.message);
    res.status(500).send("Authentication failed");
  }
};

export default {
  googleAuth,
  googleAuthCallback,
};
