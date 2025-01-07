const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// CORS 설정
app.use(cors({
  origin: [
    'https://nurring.vercel.app',
    'https://nurring-km9syzqn6-songs-projects-83486b61.vercel.app',
    'https://nurring-exg80uvr4-songs-projects-83486b61.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우트
app.use('/api/auth', require('./routes/auth'));
app.use('/api/diary', require('./routes/diary'));
app.use('/api/chat', require('./routes/chat'));

// ... 나머지 코드 