const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async (event) => {
  try {
    const { prompt } = JSON.parse(event.body || "{}");

    // Try full GPT-5 first
    let model = "gpt-5";

    const res = await openai.responses.create({
      model,
      input: prompt || "",
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: res.output_text,
        modelUsed: model,
      }),
    };
  } catch (error) {
    console.error("OpenAI error:", error.response?.data || error.message || error);

    // Optional: fallback to gpt-5-mini if full GPT-5 fails
    if (error.response?.data?.error?.message?.includes("model")) {
      try {
        const resMini = await openai.responses.create({
          model: "gpt-5-mini",
          input: JSON.parse(event.body).prompt || "",
        });
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: resMini.output_text,
            modelUsed: "gpt-5-mini",
          }),
        };
      } catch (fallbackError) {
        console.error("Fallback GPT-5-mini error:", fallbackError);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: fallbackError.response?.data || fallbackError.message }),
        };
      }
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.response?.data || error.message }),
    };
  }
};
