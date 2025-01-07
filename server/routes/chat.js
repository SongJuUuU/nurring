const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

console.log('API KEY:', process.env.OPENAI_API_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/', async (req, res) => {
  try {
    const { question } = req.body;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "당신은 육아 전문가입니다. 부모들의 육아 관련 질문에 친절하고 전문적으로 답변해주세요."
        },
        {
          role: "user",
          content: question
        }
      ]
    });

    res.json({ answer: completion.choices[0].message.content });
  } catch (error) {
    console.error('ChatGPT API 에러:', error);
    res.status(500).json({ message: '답변 생성 중 오류가 발생했습니다.' });
  }
});

module.exports = router; 