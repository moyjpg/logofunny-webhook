const express = require('express');
const multer = require('multer');
const cors = require('cors');
const Replicate = require('replicate');
const bodyParser = require('body-parser');

const app = express();
const upload = multer();

// 允许跨域
app.use(cors());

// 解析 application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// 解析 application/json
app.use(bodyParser.json());

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.post('/webhook', upload.none(), async (req, res) => {
  try {
    const { 
      'upload-1': imageUrl, 
      'textarea-1': brandName, 
      'textarea-2': tagline, 
      'checkbox-1': selectedColors, 
      'radio-1': styleChoice, 
      'textarea-3': keywords 
    } = req.body;

    console.log('Received form data:', { imageUrl, brandName, tagline, selectedColors, styleChoice, keywords });

    const input = {
      image: imageUrl,
      prompt: `${brandName}, ${tagline}, ${keywords}, Style: ${styleChoice}, Colors: ${selectedColors}`,
      a_prompt: "best quality, extremely detailed, professional design",
      n_prompt: "lowres, bad anatomy, bad proportions, blurry, poorly drawn",
      num_samples: 1,
      image_resolution: "512",
      ddim_steps: 20,
      scale: 9,
      strength: 1,
      seed: null,
    };

    const output = await replicate.run(
      "jagilley/controlnet:6241993b5c6e61d60be29323f7d5bbde88c7d329e86ad38aa5f8f5a166f79956",
      { input }
    );

    console.log('Replicate output:', output);

    res.json({ success: true, output });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: "Failed to process request" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
