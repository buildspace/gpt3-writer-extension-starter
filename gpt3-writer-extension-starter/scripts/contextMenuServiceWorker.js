const getKey = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["openai-key"], (result) => {
      if (result["openai-key"]) {
        const decodedKey = atob(result["openai-key"]);
        resolve(decodedKey);
      }
    });
  });
};
const sendMessage = (content) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0].id;

    chrome.tabs.sendMessage(
      activeTab,
      { message: "inject", content },
      (response) => {
        if (response.status === "failed") {
          console.log("injection failed.");
        }
      }
    );
  });
};

const generate = async (prompt) => {
  // Get your API key from storage
  const key = await getKey();
  const url = "https://api.openai.com/v1/completions";

  // Call completions endpoint
  const completionResponse = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 1250,
      temperature: 0.7,
    }),
  });

  // Select the top choice and send back
  const completion = await completionResponse.json();
  return completion.choices.pop();
};

const generateCompletionAction = async (info) => {
  try {
    sendMessage("generating...");
    const { selectionText } = info;
    const basePromptPrefix = `
      Write me a detailed table of contents for a blog post with the title below.
			
      
      `;

    const baseCompletion = await generate(
      `${basePromptPrefix}${selectionText}`
    );

    // Add your second prompt here
    const secondPrompt = `
      Take the table of contents write it detailed. Make it feel like a story. Don't just list the points. Go deep into each one. Explain why.
      
      ${selectionText}
      
      Table of Contents: ${baseCompletion.text}
      
      `;

    // Call your second prompt
    const secondPromptCompletion = await generate(secondPrompt);
    sendMessage(secondPromptCompletion.text);
    console.log(secondPromptCompletion.text);
  } catch (error) {
    console.log(error);
    sendMessage(error.toString());
  }
};

// Add this in scripts/contextMenuServiceWorker.js
chrome.contextMenus.create({
  id: "context-run",
  title: "Mixer brainstorm",
  contexts: ["selection"],
});

// Add listener
chrome.contextMenus.onClicked.addListener(generateCompletionAction);
