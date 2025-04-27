const express = require('express');
const multer = require('multer');
const Replicate = require('replicate');
const cors = require('cors');
require('dotenv').config();

const app = express();
const upload = multer();
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

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

        const prompt = `Generate a logo for brand "${brandName}" with style "${style}". Keywords: ${keywords}. Prefer colors: ${Array.isArray(colors) ? colors.join(', ') : colors}.`;

        const output = await replicate.run(
            "timothybrooks/instruct-pix2pix:30c10db916a6f8efce20493f5d61ee27491ab2a60437c13c588468b9810ec23f", 
            {
                input: {
                    image: imageUrl,
                    prompt: prompt
                }
            }
        );

        console.log('Replicate output:', output);

        // output 可能是一个数组，取第一个图片URL
        const imageUrlResult = Array.isArray(output) ? output[0] : output;

        res.json({ image: imageUrlResult });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to process request", details: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
