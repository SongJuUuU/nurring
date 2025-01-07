const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 회원가입
router.post('/register', async (req, res) => {
  try {
    const { email, password, babyBirthday } = req.body;
    
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: '이미 등록된 이메일입니다.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      email,
      password: hashedPassword,
      babyBirthday
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      'your_jwt_secret',
      { expiresIn: '24h' }
    );

    res.json({ token, userId: user._id });
  } catch (error) {
    console.error('회원가입 에러:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    const token = jwt.sign(
      { userId: user._id },
      'your_jwt_secret',
      { expiresIn: '24h' }
    );

    res.json({ token, userId: user._id });
  } catch (error) {
    console.error('로그인 에러:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router; 