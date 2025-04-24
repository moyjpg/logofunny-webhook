const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// 测试根路径是否正常
app.get('/', (req, res) => {
  res.send('Logofunny Webhook is running!');
});

// Webhook 路径
app.post('/webhook', async (req, res) => {
  console.log('Received webhook data:', req.body);
  res.status(200).send({ message: 'Webhook received' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
