import dotenv from 'dotenv'
import cors from 'cors'
import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import cookieParser from 'cookie-parser'

import connectDB from './config/database.js';
import User from './models/User.js';

import todoRouter from './routes/todos.js'

dotenv.config();  //to get local file into the process.env object
const app = express();

app.use(cors({
  // In production, set FRONTEND_URL in Vercel env vars (e.g. https://your-frontend.vercel.app)
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,                 // Allow cookies to be sent
}));

app.use(cookieParser());
app.use(express.json());  //to use the json in all req-res

connectDB()       //connecting the database

const JWT_SECRET = process.env.JWT_SECRET

app.get('/', (req, res) => {
  res.status(200).json({ ok: true, service: 'todo-backend' });
});

const authMiddleware = async(req,res,next) => {
  try {
    // Try to get token from HTTP-only cookie
    let token = req.cookies.token;

    // Fallback: try Authorization header (for Postman)
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    // If still no token → unauthorized
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('User details', decoded);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Attach user to request and continue
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

app.use('/api/todos',authMiddleware,todoRouter)  

app.post('/sign-up',async(req,res)=>{  //SIGN UP
  try {

    const {username,password} = req.body
    const userExists = await User.findOne({username})

    if(userExists){
      return res.status(400).json({message:"user already exists "})
    }

    const hashedPass = await bcrypt.hash(password,10)
    const user = await User.create({
      username,
      password:hashedPass
    })

    res.status(200).json({
      message:"Successfiully signed up!",
      username:user.username
    })

  } catch (error) {
    res.status(500).json({message:error.message})
  }
  
})

app.post('/sign-in',async(req,res) => {   //SIGN IN
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(403).json({ message: 'No user found' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(403).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }  
    );

    //token in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,        // not accessible from JS
      secure: true,         // true in production with HTTPS
      sameSite: 'none',       // 'lax' is fine for most apps on same domain
      // maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
    });

    res.json({
      user: {
        username: user.username,
      },
      message: 'Logged in successfully',
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

app.get('/me',authMiddleware,(req,res)=>{        //GET USER
  res.json({
    user:req.user,
    username:req.user.username
  })
})

app.post('/sign-out', (req, res) => {   //SIGN OUT
  // Clear the same cookie you set in /sign-in
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });
  res.json({ message: 'Logged out successfully' });
});

// Vercel serverless functions should export the app, not call listen().
// Locally, `npm start` will still start the server.
if (process.env.VERCEL !== '1') {
  const port = process.env.PORT || 3003;
  app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
  });
}

export default app;
