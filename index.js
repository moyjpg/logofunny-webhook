const express = require('express');
const multer = require('multer');
const cors = require('cors');
const Replicate = require('replicate');
const bodyParser = require('body-parser');

const app = express();
const upload = multer();

// Enable CORS
app.use(cors());

// Support application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Support application/json
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
      'checkbox-1': colors,
      'radio-1': style,
      'textarea-3': keywords
    } = req.body;

    console.log('Received data:', {
      imageUrl,
      brandName,
      tagline,
      colors,
      style,
      keywords
    });

    const prompt = `${brandName}, ${tagline}, keywords: ${keywords}, style: ${style}, colors: ${colors}`;

    const output = await replicate.run(
      "jagilley/controlnet:6241993b5c6e61d60be29323f7d5bbde88c7d329e86ad38aa5f8f5a166f79956",
      {
        input: {
          image: imageUrl,
          prompt: prompt,
          a_prompt: "best quality, extremely detailed, professional logo design",
          n_prompt: "lowres, bad anatomy, bad proportions, blurry, poorly drawn",
          num_samples: 1,
          image_resolution: "512",
          ddim_steps: 20,
          scale: 9,
          strength: 1,
          seed: null,
        }
      }
    );

    console.log('Replicate output:', output);

    res.json({ success: true, output });
  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ error: "Failed to process request", details: error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
