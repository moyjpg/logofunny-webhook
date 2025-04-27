const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const Replicate = require('replicate');
const cors = require('cors');

const app = express();
const upload = multer();
const port = process.env.PORT || 10000;

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/webhook', upload.none(), async (req, res) => {
  try {
    const { 
      'upload-1': imageUrl, 
      'textarea-1': brandName, 
      'textarea-2': tagline, 
      'checkbox-1': colors, 
      'radio-1': style, 
      'textarea-3': keywords 
    } = req.body;

    if (!imageUrl || !brandName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const prompt = `
      Generate a logo for a brand called "${brandName}" with the tagline "${tagline}". 
      Preferred colors: ${Array.isArray(colors) ? colors.join(', ') : colors}.
      Style: ${style}.
      Keywords to inspire the logo: ${keywords}.
    `;

    const output = await replicate.run(
      "jagilley/controlnet", // 你使用的模型
      {
        input: {
          image: imageUrl,
          prompt: prompt,
          structure: "edges", // 或根据需要改，比如可以用 "canny"
        }
      }
    );

    res.json({ image: output });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
