
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async (event) => {
  try {
    const { prompt } = JSON.parse(event.body || "{}");

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Prompt is required" }),
      };
    }

    // Call GPT-5 via Chat Completions API
    const completion = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: completion.choices[0].message.content,
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
