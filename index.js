const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const upload = multer();
app.use(cors());
app.use(express.json());

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

    const prompt = `Generate a logo for brand "${brandName}" with style "${style}", tagline "${tagline}", and keywords "${keywords}". Prefer colors: ${Array.isArray(colors) ? colors.join(', ') : colors}.`;

    const replicateResponse = await axios.post(
      'https://api.replicate.com/v1/predictions',
      {
        version: "30c1d0b916af8efece20493f5d61ee27491ab2a06437c13c588468b9810ec23f",  // instruct-pix2pix最新version id
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

    const outputImageUrl = replicateResponse.data?.prediction?.output?.[0] || replicateResponse.data?.output?.[0];

    res.json({
      brandName: brandName,
      tagline: tagline,
      generatedImageUrl: outputImageUrl
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
