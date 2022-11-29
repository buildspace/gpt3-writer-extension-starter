import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const basePromptPrefix = "Brainstorm some ideas comibining ";
const generateAction = async (req, res) => {
  // Run first prompt
  console.log(`API: ${basePromptPrefix}${req.body.userInput}`);

  const baseCompletion = await openai.createCompletion({
    model: "text-davinci-002",
    prompt: `${basePromptPrefix}${req.body.userInput}\n`,
    temperature: 0.7,
    max_tokens: 250,
  });

  const basePromptOutput = baseCompletion.data.choices.pop();

  const secondPrompt = `
  Take the table of contents below and generate a detailed idea for each one of them.

  Title: ${req.body.userInput}

  Table of Contents: ${basePromptOutput.text}

  `;

  // I call the OpenAI API a second time with Prompt #2
  const secondPromptCompletion = await openai.createCompletion({
    model: "text-davinci-002",
    prompt: `${secondPrompt}`,
    // I set a higher temperature for this one. Up to you!
    temperature: 0.85,
    // I also increase max_tokens.
    max_tokens: 1250,
  });

  // Get the output
  const secondPromptOutput = secondPromptCompletion.data.choices.pop();
  res.status(200).json({ output: secondPromptOutput });
};

export default generateAction;
