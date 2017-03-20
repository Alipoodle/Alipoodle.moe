/* == Thumbtack == */
var Thumbtack=function(){function e(){for(var e="<div id='Thumbnail'>Javascript Visualizer V1</div>",n="<style>@import url(http://fonts.googleapis.com/css?family=Oswald);#Thumbnail {  position: absolute;  top: 0; left: 0;  width: 100vw; height: 100vh;  background: #F44336;  text-align: center;  line-height: 100vh;  font-family: 'Oswald';  color: #eee;  font-size: 10vw;  text-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);  z-index: 9999;}</style>",t=window.location!=window.parent.location?document.referrer:document.location,o=["/pen/","/details/","/full/","/debug/","/live/","/collab/","/professor/","/pres/","/embed/"],r=!0,a=0;a<o.length;a++)-1!==t.indexOf(o[a])&&(r=!1);r&&(document.body.insertAdjacentHTML("afterbegin",e),document.head.insertAdjacentHTML("afterbegin",n))}return e()}();
/* == End Thumbtack == */

var canvas = document.getElementsByTagName('canvas')[0];
var canvasContext = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight / 2;

var audioContext = new AudioContext();
var audio = document.getElementsByTagName('audio')[0];

var source = audioContext.createMediaElementSource(audio);
var analyser = audioContext.createAnalyser();

source.connect(analyser);
analyser.connect(audioContext.destination);

var bufferLength = analyser.frequencyBinCount;
var frequencyData = new Uint8Array(bufferLength);

function Render() {
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  analyser.getByteFrequencyData(frequencyData);

  var frequencyWidth = (canvas.width / bufferLength),
    frequencyHeight = 0,
    x = 0;

  for (var increment = 0; increment < bufferLength; increment++) {
    frequencyHeight = frequencyData[increment] * (canvas.height * 0.003);
    canvasContext.fillStyle = 'rgb(0, 120, 255)';
    canvasContext.fillRect(x, canvas.height - frequencyHeight, frequencyWidth, frequencyHeight);
    x += frequencyWidth + 4;
  }

  call = requestAnimationFrame(Render);
}

var isPlaying = false;
var controls = document.getElementById('Controls');

controls.addEventListener('click', function() {
  isPlaying = !isPlaying;

  if (isPlaying) {
    controls.textContent = "Pause";
    controls.style.background = "#F44336";
    audio.play();
    Render();
  } else {
    controls.textContent = "Play";
    controls.style.background = "#4CAF50";
    audio.pause();
    cancelAnimationFrame(call);
  }
});

var request = new XMLHttpRequest();

request.open('GET', 'https://alipoodle.me/Sound/Unlock.mp3', true);
request.responseType = 'blob';

request.onload = function() {
  audio.src = window.URL.createObjectURL(request.response);
  console.log(request.response);
}

request.send();

window.addEventListener('resize', function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight / 2;
});