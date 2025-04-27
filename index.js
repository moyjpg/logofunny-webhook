
const express = require('express');
const bodyParser = require('body-parser');
const Replicate = require('replicate');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.json({ limit: '50mb' }));

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

app.post('/webhook', async (req, res) => {
    try {
        const { "upload-1": imageUrl, "textarea-1": brandName, "textarea-2": tagline, "checkbox-1": colors, "radio-1": style, "textarea-3": keywords } = req.body;

        const prompt = `Logo design for brand "${brandName}" with tagline "${tagline}". Style: ${style}. Keywords: ${keywords}. Colors: ${colors.join(', ')}.`;

        const output = await replicate.run(
            "jagilley/controlnet",
            {
                input: {
                    image: imageUrl,
                    prompt: prompt,
                },
            }
        );

        res.json({ image: output });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to process request" });
    }
});

app.listen(port, () => {
    console.log(`🔥 Server is running on port ${port}`);
});