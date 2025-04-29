const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
const app = express();
const upload = multer();
require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ 添加 GET 路由，供 Forminator 测试用
app.get('/webhook', (req, res) => {
  res.send('Webhook is live');
});

// 处理 POST 请求：生成 logo
app.post('/webhook', upload.none(), async (req, res) => {
  try {
    const {
      ['upload-1']: imageUrl,
      ['textarea-1']: brandName,
      ['textarea-2']: tagline,
      ['checkbox-1']: colors,
      ['radio-1']: style,
      ['textarea-3']: keywords
    } = req.body;

    const prompt = `Generate a logo for brand "${brandName}" with style "${style}". Keywords: ${keywords}. Prefer colors: ${Array.isArray(colors) ? colors.join(', ') : colors}.`;

    const response = await axios.post(
      'https://api.replicate.com/v1/predictions',
      {
        version: "67ed00e8999fecd32035074fa0f2e9a31ee03b57a8415e6a5e2f93a242ddd8d2",
        input: {
          image: imageUrl,
          prompt: prompt
        }
      },
      {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const output = response.data?.output?.[0] || null;

    res.json({
      brand: brandName,
      tagline: tagline,
      image: output
    });

  } catch (error) {
    console.error(error?.response?.data || error.message);
    res.status(500).json({
      error: "Failed to process request",
      details: error?.response?.data || error.message
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});