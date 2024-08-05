import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.js';

const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en');

const startRecordButton = document.getElementById('startRecord');
const stopRecordButton = document.getElementById('stopRecord');
const audioPlayback = document.getElementById('audioPlayback');

let mediaRecorder;
let audioChunks = [];
let mediaStream; // Declare mediaStream variable

// Function to transcribe audio data from a URL
async function transcribeAudio(audioUrl) {
    const output = await transcriber(audioUrl, { return_timestamps: true })
    displayOutput(output)
    console.log(output)
}

function displayOutput(input) {
    const outputElement = document.getElementById('result')
    const outputText = input.text
    outputElement.textContent = outputText
}
    
// Start recording
startRecordButton.addEventListener('click', async () => {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(mediaStream);

    mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Update the audio element to play the recorded audio
        audioPlayback.src = audioUrl;
        audioPlayback.style.display = 'block'; // Show the audio element

        // Reset audioChunks for the next recording
        audioChunks = [];

        // Transcribe the recorded audio using the created URL
        await transcribeAudio(audioUrl);

        // Optionally revoke the object URL if no longer needed
        // URL.revokeObjectURL(audioUrl);
    };

    mediaRecorder.start();
    startRecordButton.disabled = true;
    stopRecordButton.disabled = false;
});

// Stop recording
stopRecordButton.addEventListener('click', () => {
    mediaRecorder.stop();
    mediaStream.getTracks().forEach(track => track.stop()); // Stop all tracks of the media stream
    startRecordButton.disabled = false;
    stopRecordButton.disabled = true;
});

