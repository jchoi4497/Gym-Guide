
const { OpenAI } = require("openai");

const OpenAi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // make sure this key is in Netlify env vars
});

exports.handler = async (event) => {
  const { prompt } = JSON.parse(event.body);

  try {
    const completion = await OpenAi.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: completion.choices[0].message.content,
      }),
    };
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "OpenAI API error" }),
    };
  }
};