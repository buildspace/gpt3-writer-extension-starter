//function to get + decode API key
const getKey = () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['openai-key'], (result) => {
            if(result['openai-key']){
                const decodedKey = atob(result['openai-key']);
                resolve(decodedKey);
            }
        });
    });
};


//send message to connect dom and ui
const sendMessage = (content) => {
    chrome.tabs.query({active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0].id;

        chrome.tabs.sendMessage(
            activeTab,
            {message: 'inject', content },
            (response) => {
                if (response.status === 'failed'){
                    console.log('injection failed.');
                }
            }
        );
    });
};


//setup generate function 
const generate = async(prompt) => {
    //get your API key from storage
    const key = await getKey();
    const url = 'https://api.openai.com/v1/completions';


    //call completions endpoint
    const completionResponse = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
        },

        body: JSON.stringify({
            model: 'text-davinci-003',
            prompt: prompt,
            max_tokens: 600,
            temperature: 0.8,
        }),
    });


    const completion = await completionResponse.json();
    return completion.choices.pop();
}




//generate completion action function
const generateCompletionAction = async (info) => {
    try{
        sendMessage('generating...');

        const { selectionText } = info;
        const basePromptPrefix = `
            Write me a mini-story based on the theme provided with the title below.

            Title:
        `;

        const baseCompletion = await generate(`${basePromptPrefix}${selectionText}`);
        // console.log(baseCompletion.text);


        //2nd prompt
        const secondPrompt = `
            Take the story and the title of the story and add a funny twist to it.

            Title: ${selectionText}

            Story: ${baseCompletion.text}

            Twist:
        `;

    const secondPromptCompletion = await generate(secondPrompt);
    sendMessage(secondPromptCompletion.text);
    } catch(error) {
        console.log(error);

        sendMessage(error.toString());
    }
};



chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'context-run',
        title: 'Write a mini-story about anything',
        contexts: ['selection'],
    });
});

chrome.contextMenus.onClicked.addListener(generateCompletionAction);
