const api_version = 'v1';
const getPrefix = (withVer = true) => {
  return (`http://${localStorage.getItem('ip')}:9863` || 'http://localhost:9863') + (withVer ? `/api/${api_version}` : '');
}

const appData = {
  appId: 'ytmd-remote-control',
  appName: 'YTMD Remote Control',
  appVersion: '0.0.1'
};

document.addEventListener('DOMContentLoaded', function() {
  // Add a Custom CSS property (--control-height) on #control with the height of the window
  const control = document.getElementById('control');

  control.style.setProperty('--control-height', control.clientHeight + 'px');
  window.addEventListener('resize', () => {
    control.style.setProperty('--control-height', control.clientHeight + 'px');
  });

  if (!localStorage.getItem('ip')) {
    let ip = window.prompt(
      "Please enter the IP Address of the YouTube Music Desktop Player instance",
      "localhost"
    );

    if (ip === null) { 
      handleError({ 'code': 'NO_IP' });
      return;
    }

    localStorage.setItem('ip', ip);
  }

  fetch(`${getPrefix(false)}/metadata`)
    .then(response => response.json())
    .then(data => {
      if (data.apiVersions.indexOf(api_version) === -1) {
        handleError({ 'code': 'UNSUPPORTED_API' });
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });


  if (!localStorage.getItem('code') || !localStorage.getItem('token')) {
    getCode();
  }

  else {
    getInitialStateAndStart();
  }
});

function getCode() {
  fetch(`${getPrefix()}/auth/requestcode`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(appData),
    timeout: 30000
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        handleError(data);
        return;
      }

      console.log('Successfully got Code', data.code);
      localStorage.setItem('code', data.code);

      getToken();
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

function getToken() {
  showInfo(
    "Authorization Required",
    [
      "Please authorize the application to continue. YouTube Music Desktop Player will open a new Window to authorize the application.",
      "Please check it uses the code below:",
      `Code: ${localStorage.getItem('code')}`
    ]
  );

  fetch(`${getPrefix()}/auth/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      code: localStorage.getItem('code'),
      appId: appData.appId
    }),
    timeout: 30000
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        handleError(data);
        return;
      }

      console.log('Successfully got Token');
      localStorage.setItem('token', data.token);
      getInitialStateAndStart();
    })
    .catch(error => {
      console.error('Error:', error);
    })
    .finally(() => {
      infoDialog.close();
    })
}

function getInitialStateAndStart() {
  fetch(`${getPrefix()}/state`, {
    headers: {
      'Authorization': localStorage.getItem('token')
    }
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        handleError(data);
        return;
      }
      console.log('Success:', data);

      displayState(data);
    })
    .catch(error => {
      console.error('Error:', error);
    });


  var socket = io(`ws://${getPrefix().replace('http://', '')}/realtime`, {
    auth: {
      token: localStorage.getItem('token')
    },
    transports: ['websocket']
  })
  socket.on("state-update", (stateData) => {
    displayState(stateData);
  })
}

const errorDialog = document.getElementById('error-dialog');
function handleError(data) {

  if (!data.code) {
    errorDialog.querySelector('h2').innerText = data.error;
    errorDialog.querySelector('p').innerText = data.message;
    errorDialog.showModal();
    return;
  }

  errorDialog.querySelector('h2').innerText = "Error - " + data.code;
  switch (data.code) {
    case 'NO_IP':
      errorDialog.querySelector('p').innerText = "No IP Address was provided. Please refresh and try again.";
      break;

    case 'UNSUPPORTED_API':
      errorDialog.querySelector('p').innerText = `No supported API Version in current Application. Required Version ${api_version}. Please update YouTube Music Desktop Player.`;
      break;

    case 'UNAUTHENTICATED':
      errorDialog.querySelector('p').innerText = "You are not authenticated. Please try again.";
      localStorage.removeItem('code');
      localStorage.removeItem('token');
      break;

    case 'AUTHORIZATION_TIME_OUT':
      errorDialog.querySelector('p').innerText = "Authorization request timed out. Please try again.";
      break;

    case 'AUTHORIZATION_DENIED':
      errorDialog.querySelector('p').innerText = "Authorization request was denied. Please try again.";
      break;

    case 'AUTHORIZATION_TOO_MANY':
      errorDialog.querySelector('p').innerText = "Too many authorization requests. Please try removing some other connections and try again.";
      break;

    case 'AUTHORIZATION_DISABLED':
      errorDialog.querySelector('p').innerText = "New Authorizations are currently disabled. Please enable it and try again.";
      break;

    case 'AUTHORIZATION_INVALID':
      errorDialog.querySelector('p').innerText = "Authorization code is invalid. Please try again.";
      break;

    case 'YOUTUBE_MUSIC_UNVAILABLE':
      errorDialog.querySelector('p').innerText = "YouTube Music is currently unavailable. Please try again later.";
      break;

    case 'YOUTUBE_MUSIC_TIME_OUT':
      errorDialog.querySelector('p').innerText = "Request to YouTube Music timed out. Please try again.";
      break;
  }

  errorDialog.showModal()
}
errorDialog.querySelector('button').addEventListener('click', function() {
  errorDialog.close();
});

const infoDialog = document.getElementById('info-dialog');
function showInfo(title, message) {
  infoDialog.querySelector('h2').innerText = title;
  infoDialog.querySelector('p').innerText = (
    typeof message === "object"
      ? message.join('\n')
      : message
  );
  infoDialog.showModal();
}
infoDialog.querySelector('button').addEventListener('click', function() {
  infoDialog.close();
});

var lastState = null;
function displayState(stateData) {
  const {
    video,
    player,
    playlistId
  } = stateData;

  if (!lastState || lastState.video.author !== video.author) {
    document.getElementById('artist').innerText = video.author;
  }

  if (!lastState || lastState.video.title !== video.title) {
    document.getElementById('title').innerText = video.title;
  }

  if (!lastState || lastState.video.likeStatus !== video.likeStatus) {
    // -1 = Unknown, 0 Disliked, 1 = Indifferent, 2 = Liked
    const likeIcon = document.querySelector('#control-like svg use');
    const dislikeIcon = document.querySelector('#control-dislike svg use');

    switch(video.likeStatus) {
      case 0:
        likeIcon.setAttribute('href', '#like-outline');
        dislikeIcon.setAttribute('href', '#dislike-filled');
        break;

      case 2:
        likeIcon.setAttribute('href', '#like-filled');
        dislikeIcon.setAttribute('href', '#dislike-outline');
        break;

      default:
        likeIcon.setAttribute('href', '#like-outline');
        dislikeIcon.setAttribute('href', '#dislike-outline');
        break;
    }
  }

  if (!lastState || lastState.video.id !== video.id) {
    // We can update a few things here
    const thumbnail = getLargeThumbnail(video.thumbnails);
    let albumArts = document.getElementsByClassName('albumart')
    for (let i = 0; i < albumArts.length; i++) {
      albumArts[i].src = thumbnail;
    }

    const totalDuration = humanReadableSeconds(video.durationSeconds);
    document.getElementsByClassName('totaltime')[0].innerText = totalDuration;
  }


  if (!lastState || lastState.player.trackState !== player.trackState) {
    const playPauseButton = document.getElementById('control-playpause');

    // #control-playpause div svg use
    const playPauseIcon = document.querySelector('#control-playpause div svg use');
    if (player.trackState === 0) {
      playPauseIcon.setAttribute('href', '#play');
    }
    else if (player.trackState === 1) {
      playPauseIcon.setAttribute('href', '#pause');
    }

    // This is kinda bad because as it doesn't show well due to how short the buffer is
    if (player.trackState === 2) {
      playPauseIcon.setAttribute('href', '#buffer');
      playPauseIcon.parentElement.classList.add('buffer-rotate');
    }
    else {
      playPauseIcon.parentElement.classList.remove('buffer-rotate');
    }
  }

  if (!lastState || lastState.player.queue.repeatMode !== player.queue.repeatMode) {
    const repeatIcon = document.querySelector('#control-repeat svg use');
    repeatIcon.setAttribute('data-state', player.queue.repeatMode);
    if (player.queue.repeatMode === 0) {
      repeatIcon.setAttribute('href', '#repeat-off');
    }
    else if (player.queue.repeatMode === 1) {
      repeatIcon.setAttribute('href', '#repeat-queue');
    }
    else if (player.queue.repeatMode === 2) {
      repeatIcon.setAttribute('href', '#repeat-song');
    }
  }

  if (!lastState || lastState.player.videoProgress !== player.videoProgress) {
    // Update the progress bar
    const durationPercent = player.videoProgress / video.durationSeconds;

    document.getElementById('progressbar').style.transform = `scaleX(${durationPercent})`;
    document.getElementById('progressSliderKnob').style.left = `${durationPercent * 100}%`;

    const currentTime = humanReadableSeconds(player.videoProgress);
    document.getElementsByClassName('currenttime')[0].innerText = currentTime;
  }

  if (!lastState || lastState.player.volume !== player.volume) {
    const volumePercent = player.volume;
    document.getElementById('volumebar').style.transform = `scaleX(${volumePercent / 100})`;
    document.getElementById('volumeSliderKnob').style.left = `${volumePercent}%`;
  }

  lastState = stateData;
}

function getLargeThumbnail(thumbnails) {
  var maxHeight = 0;
  var maxThumbnail = null;
  thumbnails.forEach(thumbnail => {
    if (thumbnail.height > maxHeight) {
      maxHeight = thumbnail.height;
      maxThumbnail = thumbnail;
    }
  });

  return maxThumbnail.url;
}

function humanReadableSeconds(seconds) {
  seconds = Math.floor(seconds);
  // Have to convert to MM:SS but also HH:MM:SS
  if (seconds < 60) {
    return `00:${seconds < 10 ? '0' : ''}${seconds}`;
  }
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }

  const hours = Math.floor(seconds / 3600);
  const remainingMinutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours < 10 ? '0' : ''}${hours}:${remainingMinutes < 10 ? '0' : ''}${remainingMinutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// ----------------------------------------------------------

document.getElementById('control-playpause').addEventListener('click', function() {
  sendCommand('playPause');
});

document.getElementById('control-previous').addEventListener('click', function() {
  sendCommand('previous');
});

document.getElementById('control-next').addEventListener('click', function() {
  sendCommand('next');
});

document.getElementById('control-repeat').addEventListener('click', function(e) {
  const repeatIcon = document.querySelector('#control-repeat svg use');

  const currentState = repeatIcon.getAttribute('data-state');
  let nextState = (currentState + 1) % 3;

  sendCommand('repeatMode', nextState)
});

document.getElementById('control-shuffle').addEventListener('click', function() {
  sendCommand('shuffle');
});

document.getElementById('control-like').addEventListener('click', function() {
  sendCommand('toggleLike');
});

document.getElementById('control-dislike').addEventListener('click', function() {
  sendCommand('toggleDislike');
});

document.getElementById('control-volume-toggle').addEventListener('click', function() {
  const currentState = document.getElementById('control-volume-toggle').getAttribute('data-state');
  let nextState = currentState === 'mute' ? 'unmute' : 'mute';

  sendCommand(nextState)
    .then(() => {
      document.getElementById('control-volume-toggle').setAttribute('data-state', nextState);

      if (nextState === 'mute') {
        document.querySelector('#control-volume-toggle svg use').setAttribute('href', `#volume-mute`);
      }
      else {
        document.querySelector('#control-volume-toggle svg use').setAttribute('href', `#volume`);
      }
    });
});

document.getElementById('progressSliderBar').addEventListener('click', function(e) {
  const percentage = e.offsetX / e.target.clientWidth;
  const duration = lastState.video.durationSeconds * percentage;

  sendCommand('seekTo', duration);
});

document.getElementById('volumeSliderBar').addEventListener('click', function(e) {
  const percentage = e.offsetX / e.target.clientWidth;
  sendCommand('setVolume', parseInt(percentage * 100));
});

function sendCommand(command, data = null) {
  const body = {
    command
  };
  if (data !== null) {
    body.data = data;
  }

  return fetch(`${getPrefix()}/command`, {
    method: 'POST',
    headers: {
      'Authorization': localStorage.getItem('token'),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
    .catch(error => {
      console.error('Error:', error);
    });
}