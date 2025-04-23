const express = require("express");
const bodyParser = require("body-parser");
const Replicate = require("replicate");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.post("/webhook", async (req, res) => {
  const data = req.body;
  const imageUrl = data["upload-1"];
  const brandName = data["textarea-1"];
  const tagline = data["textarea-2"];
  const keywords = data["checkbox-1"];
  const color = data["radio-1"];
  const notes = data["textarea-3"];

  try {
    const prompt = `${brandName}, ${tagline}, ${keywords}, ${color}, ${notes}`;

    const prediction = await replicate.run(
      process.env.REPLICATE_VERSION_ID,
      {
        input: {
          image: imageUrl,
          prompt: prompt,
        },
      }
    );

    res.json({ status: "success", output: prediction });
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.message;
    console.error("Replicate Error:", errorMsg);
    res.status(500).json({ status: "error", message: errorMsg });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});