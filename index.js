const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// 解析 application/json 请求体
app.use(bodyParser.json());

// 根路径测试接口
app.get('/', (req, res) => {
  res.send('🔥 Logofunny Webhook is running!');
});

// webhook 接口
app.post('/webhook', async (req, res) => {
  try {
    console.log('✅ Received webhook data:', req.body);
    res.status(200).send({ message: 'Webhook received successfully' });
  } catch (error) {
    console.error('❌ Error handling webhook:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});