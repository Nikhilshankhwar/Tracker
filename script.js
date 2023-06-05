let mediaStream;
let audioContext;
let analyzer;
const startTracking = () => {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then((stream) => {
      mediaStream = stream;
      audioContext = new AudioContext();
      analyzer = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyzer);
      analyzer.fftSize = 32;
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const updateNoiseLevel = () => {
        analyzer.getByteFrequencyData(dataArray);
        let total = 0;
        for (let i = 0; i < bufferLength; i++) {
          total += dataArray[i];
        }
        const average = total / bufferLength;
        document.getElementById('noise-level').textContent = average + ' dB';
        requestAnimationFrame(updateNoiseLevel);
      };
      updateNoiseLevel();
    })
    .catch((error) => {
      console.error('Error accessing microphone:', error);
    });
};
const stopTracking = () => {
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
    audioContext.close().then(() => {
      audioContext = null;
    });
  }
};
document.getElementById('start-btn').addEventListener('click', startTracking);
document.getElementById('stop-btn').addEventListener('click', stopTracking);
