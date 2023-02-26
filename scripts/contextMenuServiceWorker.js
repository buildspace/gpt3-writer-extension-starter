// New function here
const generateCompletionAction = async (info) => {
  try {
    const { selectionText } = info;
    const basePromptPrefix = `
        Write me a detailed table of contents for a blog post with the title below.
    
        Title:
        `;
  } catch (error) {
    console.error(error);
  }
};

// Don't touch this
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "context-run",
    title: "Generate blog post",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(generateCompletionAction);
