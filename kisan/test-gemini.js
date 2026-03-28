const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyCV-K_PtkKiVP1ljdhmdOXErc303xxQPrc");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function test() {
  const result = await model.generateContent("What is the best crop to grow in Punjab India in summer? Answer in 3 lines.");
  console.log("RESPONSE:", result.response.text());
}

test().catch(console.error);
