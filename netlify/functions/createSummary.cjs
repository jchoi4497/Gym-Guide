const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.handler = async (event) => {
  try {
    const { prompt } = JSON.parse(event.body || "{}");

    if (!prompt) {
      return { statusCode: 400, body: JSON.stringify({ error: "Prompt is required" }) };
    }

    const res = await openai.responses.create({
      model: "gpt-5",
      input: prompt,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: res.output_text,
        modelUsed: "gpt-5",
      }),
    };
  } catch (error) {
    console.error("OpenAI error:", error.response?.data || error.message || error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.response?.data || error.message || "OpenAI API error",
      }),
    };
  }
};
