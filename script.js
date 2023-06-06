let mediaStream;
let audioContext;
let analyzer;
let mediaRecorder;
let chunks = [];
const userProfile = {
  name: '',
  email: '',
  threshold: 70,
};
const updateProfile = () => {
  const nameInput = document.getElementById('name-input');
  const emailInput = document.getElementById('email-input');
  const thresholdInput = document.getElementById('threshold-input');
  userProfile.name = nameInput.value;
  userProfile.email = emailInput.value;
  userProfile.threshold = Number(thresholdInput.value);
};
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
const graphCanvas = document.getElementById('noise-graph');
const graphContext = graphCanvas.getContext('2d');
const graphData = new Uint8Array(bufferLength); 
const updateNoiseGraph = () => {
  analyzer.getByteFrequencyData(dataArray);
  graphContext.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
  graphContext.fillStyle = '#4CAF50'; 
  const barWidth = graphCanvas.width / bufferLength;
  for (let i = 0; i < bufferLength; i++) {
    const barHeight = dataArray[i] / 2; 
    const x = i * barWidth;
    const y = graphCanvas.height - barHeight;
    graphContext.fillRect(x, y, barWidth, barHeight);
  }
  requestAnimationFrame(updateNoiseGraph);
};
updateNoiseGraph();
      const updateNoiseLevel = () => {
        analyzer.getByteFrequencyData(dataArray);
        let total = 0;
        for (let i = 0; i < bufferLength; i++) {
          total += dataArray[i];
        }
        const average = total / bufferLength;
        document.getElementById('noise-level').textContent = average + ' dB';
        if (average > userProfile.threshold) {
          showNotification('High Noise Level', `The noise level has exceeded ${userProfile.threshold} dB.`);
        }
        requestAnimationFrame(updateNoiseLevel);
      };
      updateNoiseLevel();
    })
    .catch((error) => {
      console.error('Error accessing microphone:', error);
    });
};
const saveProfile = () => {
  updateProfile();
  const profileData = JSON.stringify(userProfile);
  localStorage.setItem('userProfile', profileData);
  console.log('Profile saved:', userProfile);
};
const retrieveProfile = () => {
  const profileData = localStorage.getItem('userProfile');
  if (profileData) {
    userProfile = JSON.parse(profileData);
    document.getElementById('name-input').value = userProfile.name;
    document.getElementById('email-input').value = userProfile.email;
    document.getElementById('threshold-input').value = userProfile.threshold;
    console.log('Profile retrieved:', userProfile);
  }
};
document.getElementById('save-profile-btn').addEventListener('click', saveProfile);
window.addEventListener('load', retrieveProfile);
const startRecording = () => {
  if (mediaStream) {
    mediaRecorder = new MediaRecorder(mediaStream);
    mediaRecorder.start();
    chunks = [];
    mediaRecorder.addEventListener('dataavailable', (event) => {
      chunks.push(event.data);
    });
  }
};
const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    mediaRecorder.removeEventListener('dataavailable');
    const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
    const audioUrl = URL.createObjectURL(blob);
    const audioElement = document.getElementById('audio-recording');
    audioElement.src = audioUrl;
    audioElement.style.display = 'block';
  }
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
document.getElementById('start-btn').addEventListener('click', () => {
  startTracking();
  startRecording();
});
document.getElementById('stop-btn').addEventListener('click', () => {
  stopTracking();
  stopRecording();
});
const getLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showLocation);
  } else {
    console.error('Geolocation is not supported');
  }
};
const showNotification = (title, message) => {
  if (Notification.permission === 'granted') {
    const sound = new Audio('notification-sound.wav');
    sound.play();
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        showNotification(title, message);
      }
    }).catch((error) => {
      console.error('Error requesting notification permission:', error);
    });
  }
};
const showLocation = (position) => {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  document.getElementById('location').textContent = `Latitude: ${latitude}, Longitude: ${longitude}`;
};
window.addEventListener('load', getLocation);
const noiseLevelVisual = document.getElementById('noise-level-visual');
const MAX_BAR_HEIGHT = 100;
const updateNoiseLevelVisual = (average) => {
  const barHeight = (average / 255) * MAX_BAR_HEIGHT; // Scale the average value to fit the maximum bar height
  noiseLevelVisual.style.height = barHeight + 'px';
};
const updateNoiseLevel = () => {
  analyzer.getByteFrequencyData(dataArray);
  let total = 0;
  for (let i = 0; i < bufferLength; i++) {
    total += dataArray[i];
  }
  const average = total / bufferLength;
  document.getElementById('noise-level').textContent = average + ' dB';
  updateNoiseLevelVisual(average); 
  if (average > userProfile.threshold) {
    showNotification('High Noise Level', `The noise level has exceeded ${userProfile.threshold} dB.`);
  }
  requestAnimationFrame(updateNoiseLevel);
};
document.addEventListener('DOMContentLoaded', () => {
  if (Notification.permission !== 'granted') {
    Notification.requestPermission().then((permission) => {
      if (permission !== 'granted') {
        console.warn('Notification permission denied.');
      }
    }).catch((error) => {
      console.error('Error requesting notification permission:', error);
    });
  }
});
document.getElementById('profile-form').addEventListener('submit', (event) => {
  event.preventDefault();
  updateProfile();
});
