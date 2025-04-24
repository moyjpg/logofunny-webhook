const express = require('express');
const bodyParser = require('body-parser');
const Replicate = require('replicate');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.use(bodyParser.json());

// 测试是否正常运行
app.get('/', (req, res) => {
  res.send('Logofunny Webhook is running!');
});

// 处理 Fluent Forms webhook 请求
app.post('/webhook', async (req, res) => {
  try {
    console.log('📥 Received webhook data:', req.body);

    const {
      ['upload-1']: image_url,
      ['textarea-1']: brand,
      ['textarea-2']: subtitle,
      ['checkbox-1']: styles,
      ['radio-1']: color,
      ['textarea-3']: keywords
    } = req.body;

    const prompt = `Design a logo for "${brand}", tagline "${subtitle}". Style: ${styles.join(', ')}, color theme: ${color}. Keywords: ${keywords}`;

    const output = await replicate.run(
      "jagilley/controlnet",
      {
        input: {
          image: image_url,
          prompt: prompt,
          structure: "canny",
          num_outputs: 1,
          num_inference_steps: 20,
          guidance_scale: 9,
        }
      }
    );

    console.log('✅ Replicate output:', output);

    res.status(200).send({
      message: 'Webhook received successfully',
      image: output[0]
    });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).send({ error: 'Failed to process request' });
  }
});

app.listen(port, () => {
  console.log(`🔥 Server is running on port ${port}`);
});
