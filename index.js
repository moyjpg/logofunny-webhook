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

        const prompt = `Generate a logo for brand "${brandName}" with style "${style}". Keywords: ${keywords}. Prefer colors: ${Array.isArray(colors) ? colors.join(', ') : colors}. Tagline: ${tagline}`;

        if (!process.env.REPLICATE_API_TOKEN) {
            throw new Error('Missing Replicate API Token');
        }

        const replicateResponse = await axios.post(
            'https://api.replicate.com/v1/predictions',
            {
                version: "7be03b29380c20d0575a5d25e2a3c5421fb63b87e8ef7fada2b2a73748c2ec85",
                input: {
                    image: imageUrl, // 注意，这里要看你的model要不要base64
                    prompt: prompt,
                    controlnet_conditioning_scale: 1.2,  // 给点固定参数，不然模型不一定跑
                    guess_mode: true
                }
            },
            {
                headers: {
                    Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({ prediction: replicateResponse.data });
    } catch (error) {
        console.error("Error during webhook handling:", error);

        if (error.response) {
            // 这里是请求成功但Replicate API返回了错误（比如参数错误）
            res.status(error.response.status).json({
                error: "Replicate API returned an error",
                details: error.response.data
            });
        } else if (error.request) {
            // 这里是请求根本没发出去（比如网络问题）
            res.status(500).json({
                error: "No response from Replicate API",
                details: error.message
            });
        } else {
            // 其他未知错误
            res.status(500).json({
                error: "Unexpected error",
                details: error.message
            });
        }
    }
});
