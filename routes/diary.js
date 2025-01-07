const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Diary = require('../models/Diary');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    key: function (req, file, cb) {
      cb(null, 'uploads/' + Date.now() + '-' + file.originalname);
    }
  })
});

// 인증 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
  }

  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) {
      console.error('토큰 검증 에러:', err);
      return res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
    }
    req.user = user;
    next();
  });
};

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 일기 작성 (인증 필요)
router.post('/', authenticateToken, async (req, res) => {
  try {
    // multer 미들웨어를 라우트 핸들러 내부에서 실행
    req.app.locals.upload(req, res, async function(err) {
      if (err) {
        return res.status(400).json({ 
          message: err.message || '파일 업로드에 실패했습니다.' 
        });
      }

      const { title, content } = req.body;
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

      const diary = new Diary({
        user: req.user.userId,
        title,
        content,
        imageUrl
      });

      await diary.save();
      res.status(201).json(diary);
    });
  } catch (error) {
    console.error('일기 작성 에러:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 일기 목록 조회 (인증 필요)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const diaries = await Diary.find({ user: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(diaries);
  } catch (error) {
    console.error('일기 목록 조회 에러:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router; 