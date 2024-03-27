const outputBox = document.getElementById('output-box');
const textInput = document.getElementById('text-input');
const submitBtn = document.getElementById('submit-btn');
const recordBtn = document.getElementById('record-btn');
const loadingMessage = document.getElementById('loading-message');
const loadingText = document.getElementById('loading-text');
const settingsToggle = document.getElementById('settings-toggle');
const settingsContent = document.getElementById('settings-content');
const endpointUrlInput = document.getElementById('endpoint-url');
const maxTokensSlider = document.getElementById('max-tokens');
const maxTokensValue = document.getElementById('max-tokens-value');
const temperatureSlider = document.getElementById('temperature');
const temperatureValue = document.getElementById('temperature-value');
const openaiApiKeyInput = document.getElementById('openai-api-key');


maxTokensSlider.addEventListener('input', function () {
  maxTokensValue.textContent = maxTokensSlider.value;
});

temperatureSlider.addEventListener('input', function () {
  temperatureValue.textContent = temperatureSlider.value;
});

let mediaRecorder;
let audioChunks = [];

settingsToggle.addEventListener('click', function () {
  if (settingsContent.style.display === 'none') {
    settingsContent.style.display = 'block';
  } else {
    settingsContent.style.display = 'none';
  }
});

function startRecording() {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function (stream) {
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();
      recordBtn.textContent = 'Stop Recording';

      mediaRecorder.ondataavailable = function (e) {
        audioChunks.push(e.data);
      };

      mediaRecorder.onstop = function () {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        sendAudioToServer(audioBlob);
        audioChunks = [];
      };
    })
    .catch(function (error) {
      console.error('Error accessing microphone:', error);
      alert('Error accessing microphone. Please check your browser permissions and try again.');
    });
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    recordBtn.textContent = 'Record';
  }
}

function showLoadingMessage(text) {
  loadingText.textContent = text;
  loadingMessage.style.display = 'block';
}

function hideLoadingMessage() {
  loadingMessage.style.display = 'none';
}

function sendAudioToServer(audioBlob) {
  showLoadingMessage('Sending info...');

  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.wav');

  const headers = {};
  if (openaiApiKeyInput.value) {
    headers['Authorization'] = `Bearer ${openaiApiKeyInput.value}`;
  }

  fetch(`${endpointUrlInput.value}/v1/audio/speechAndTextGenerations`, {
    method: 'POST',
    headers: headers,
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      displayUserMessage(data.transcription, audioBlob);
      displayAssistantMessage(data.generated_text, data.audio_url);
    })
    .catch(error => {
      console.error('Error:', error);
      displayErrorMessage('An error occurred while processing the audio.');
      hideLoadingMessage();
    });
}

function sendTextToServer() {
  showLoadingMessage('Sending info...');

  const instructionTemplate = document.getElementById('instruction-template').value;
  const maxTokens = parseInt(maxTokensSlider.value);
  const temperature = parseFloat(temperatureSlider.value);
  const textarea = document.querySelector('textarea');
  const text = textarea ? textarea.value : textInput.value;

  // Encode newline characters in the text
  const encodedText = text.replace(/\n/g, '\\n');

  const headers = {
    'Content-Type': 'application/json'
  };
  if (openaiApiKeyInput.value) {
    headers['Authorization'] = `Bearer ${openaiApiKeyInput.value}`;
  }

  fetch(`${endpointUrlInput.value}/v1/completions`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      prompt: `${instructionTemplate}\n\nUser: ${encodedText}\n\nAssistant:`,
      max_tokens: maxTokens,
      n: 1,
      stop: null,
      temperature: temperature
    })
  })
    .then(response => response.json())
    .then(data => {
      displayUserMessage(text);
      displayAssistantMessage(data.choices[0].text);
    })
    .catch(error => {
      console.error('Error:', error);
      displayErrorMessage('An error occurred while processing the text.');
      hideLoadingMessage();
    });
}

function displayUserMessage(transcription, audioBlob) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  
  const labelElement = document.createElement('p');
  labelElement.classList.add('message-label');
  labelElement.textContent = 'You:';
  
  const transcriptionElement = document.createElement('p');
  transcriptionElement.textContent = transcription;
  
  messageElement.appendChild(labelElement);
  messageElement.appendChild(transcriptionElement);
  
  if (audioBlob) {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audioElement = document.createElement('audio');
    audioElement.src = audioUrl;
    audioElement.controls = true;
    audioElement.classList.add('audio-player');
    messageElement.appendChild(audioElement);
  }
  
  outputBox.appendChild(messageElement);
  outputBox.scrollTop = outputBox.scrollHeight;
}

function displayAssistantMessage(text, audioUrl) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  
  const labelElement = document.createElement('p');
  labelElement.classList.add('message-label');
  labelElement.textContent = 'AI:';
  
  const textElement = document.createElement('div');
  
  // Split the text into code blocks, inline code, and regular text
  const parts = text.split(/(```[\w\s]*\n[\s\S]*?\n```|`[^`]*`)/);
  
  parts.forEach(part => {
    if (part.startsWith('```')) {
      // Code block
      const codeBlockElement = document.createElement('div');
      codeBlockElement.classList.add('code-block');
      
      const [language, ...codeLines] = part.slice(3, -3).split('\n');
      const code = codeLines.join('\n');
      
      const languageElement = document.createElement('div');
      languageElement.classList.add('code-language');
      languageElement.textContent = language.trim();
      codeBlockElement.appendChild(languageElement);
      
      const codeElement = document.createElement('pre');
      const codeContentElement = document.createElement('code');
      codeContentElement.textContent = code.trim();
      codeElement.appendChild(codeContentElement);
      codeBlockElement.appendChild(codeElement);
      
      const copyButtonElement = document.createElement('button');
      copyButtonElement.classList.add('copy-button');
      copyButtonElement.textContent = 'Copy Code';
      copyButtonElement.addEventListener('click', () => {
        copyToClipboard(code.trim());
      });
      codeBlockElement.appendChild(copyButtonElement);
      
      textElement.appendChild(codeBlockElement);
    } else if (part.startsWith('`') && part.endsWith('`')) {
      // Inline code
      const inlineCodeElement = document.createElement('code');
      inlineCodeElement.textContent = part.slice(1, -1);
      textElement.appendChild(inlineCodeElement);
    } else {
      // Regular text
      const paragraphElement = document.createElement('p');
      paragraphElement.innerHTML = part.replace(/\n/g, '<br>').replace(/\d+\. /g, match => `${match}<br>`);
      textElement.appendChild(paragraphElement);
    }
  });
  
  messageElement.appendChild(labelElement);
  messageElement.appendChild(textElement);
  
  if (audioUrl) {
    const audioElement = document.createElement('audio');
    audioElement.src = `${endpointUrlInput.value}${audioUrl}`;
    audioElement.controls = true;
    audioElement.autoplay = true; // Add this line to enable autoplay
    audioElement.classList.add('audio-player');
    messageElement.appendChild(audioElement);
  }
  
  outputBox.appendChild(messageElement);
  outputBox.scrollTop = outputBox.scrollHeight;
  
  hideLoadingMessage();
}

function copyToClipboard(text) {
  const tempTextarea = document.createElement('textarea');
  tempTextarea.value = text;
  document.body.appendChild(tempTextarea);
  tempTextarea.select();
  document.execCommand('copy');
  document.body.removeChild(tempTextarea);
}

function displayErrorMessage(text) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  
  const labelElement = document.createElement('p');
  labelElement.classList.add('message-label');
  labelElement.textContent = 'Error:';