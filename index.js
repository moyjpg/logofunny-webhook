const express = require('express');
const cors = require('cors');
const Replicate = require('replicate');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const upload = multer();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.post('/webhook', upload.none(), async (req, res) => {
  try {
    console.log('✅ Webhook received!');
    const { 'upload-1': imageUrl, 'textarea-1': brandName, 'textarea-2': tagline, 'checkbox-1': colorOptions, 'radio-1': style, 'textarea-3': keywords } = req.body;

    if (!imageUrl || !brandName || !keywords) {
      console.error('❌ Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('🖼️ Image URL:', imageUrl);
    console.log('🏷️ Brand Name:', brandName);
    console.log('✍️ Tagline:', tagline);
    console.log('🎨 Color Options:', colorOptions);
    console.log('🎨 Style:', style);
    console.log('📝 Keywords:', keywords);

    const input = {
      image: imageUrl,
      prompt: `${brandName} ${tagline} ${keywords}`,
      a_prompt: style || 'minimalist, modern',
      num_samples: 1,
      image_resolution: '512',
    };

    console.log('🚀 Calling Replicate API with input:', input);

    const output = await replicate.run('jagilley/controlnet', { input });

    console.log('✅ Replicate API call success');
    res.json({ output });
  } catch (error) {
    console.error('❌ Error processing request:', error.message);
    res.status(500).json({ error: 'Failed to process request', detail: error.message });
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`🔥 Server is running on port ${port}`);
});
