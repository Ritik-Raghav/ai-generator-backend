import User from '../models/user.js';
import axios from 'axios';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET_KEY;
const REDIRECT_URI = 'http://localhost:3000/google/callback'; // backend route!

const googleAuth = async (req, res, next) => {
  try {
    const url = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${CLIENT_ID}&` +
      `redirect_uri=${REDIRECT_URI}&` +
      `response_type=code&` +
      `scope=openid%20email%20profile`;

    res.redirect(url);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Authentication error');
  }
};

const googleAuthCallback = async (req, res, next) => {
  const code = req.query.code;
  try {
    // Exchange code for tokens
    const { data } = await axios.post(`https://oauth2.googleapis.com/token`, {
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    const accessToken = data.access_token;

    // Get user info
    const userInfo = await axios.get(`https://www.googleapis.com/oauth2/v2/userinfo`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const { email, name, picture } = userInfo.data;

    // Check if user exists
    let user = await User.findOne({ where: { email } });

    if (!user) {
      user = await User.create({
        email,
        name,
        picture
      });
    }

    // Create JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    const FRONTEND_URL = "http://localhost:8080";

    res.redirect(`${FRONTEND_URL}/?token=${token}`);

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send('Authentication error');
  }
};

const authController = {
  googleAuth,
  googleAuthCallback
};

export default authController;
