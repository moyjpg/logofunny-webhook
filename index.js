import express from 'express';
import formidable from 'express-formidable';
import fetch from 'node-fetch';

const app = express();
const port = process.env.PORT || 10000;

app.use(formidable());

app.post('/webhook', async (req, res) => {
  try {
    const data = req.fields;
    console.log('Received form data:', data);

    const response = await fetch('https://api.replicate.com/v1/models/jagilley/controlnet/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          image: data['upload-1'],
          brand_name: data['textarea-1'],
          tagline: data['textarea-2'],
          brand_keywords: data['textarea-3'],
          colors: Array.isArray(data['checkbox-1']) ? data['checkbox-1'] : [data['checkbox-1']],
          style: data['radio-1'],
        }
      })
    });

    const result = await response.json();
    console.log('Replicate result:', result);

    res.json(result);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
