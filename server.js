require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// 미들웨어 설정
app.use(cors({
  origin: ['http://localhost:3000', 'https://nurring.vercel.app'],  // Vercel 도메인 추가
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,  // 추가
  useFindAndModify: false  // 추가
}).then(() => {
  console.log('MongoDB 연결 성공');
}).catch((err) => {
  console.error('MongoDB 연결 실패:', err);
});

// MongoDB 연결 이벤트 리스너 추가
mongoose.connection.on('error', (err) => {
  console.error('MongoDB 연결 에러:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB 연결이 끊어졌습니다.');
});

// uploads 폴더가 없으면 생성
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// 파일 업로드 설정
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function(req, file, cb) {
    cb(null, 'IMAGE-' + Date.now() + path.extname(file.originalname));
  }
});

// 파일 형식 제한 추가
const fileFilter = (req, file, cb) => {
  // 이미지 파일만 허용
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('이미지 파일만 업로드 가능합니다.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 10000000,  // 10MB
    files: 1  // 한 번에 1개 파일만
  },
  fileFilter: fileFilter
}).single('image');

// multer 설정을 app.locals에 추가
app.locals.upload = upload;

// 라우트 설정
app.use('/api/auth', require('./routes/auth'));
app.use('/api/diary', require('./routes/diary'));
app.use('/api/chat', require('./routes/chat'));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`서버가 ${PORT}번 포트에서 실행중입니다.`)); 