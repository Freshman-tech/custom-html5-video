const videoContainer = document.getElementById('video-container');
const video = document.getElementById('video');
const videoControls = document.getElementById('video-controls');
const progressBar = document.getElementById('progress-bar');
const seek = document.getElementById('seek');
const seekTooltip = document.getElementById('seek-tooltip');
const playButton = document.getElementById('play');
const playbackIcons = document.querySelectorAll('.playback-icons use');
const volumeButton = document.getElementById('volume-button');
const volumeIcons = document.querySelectorAll('.volume-button use');
const volumeMute = document.querySelector('use[href="#volume-mute"]');
const volumeLow = document.querySelector('use[href="#volume-low"]');
const volumeHigh = document.querySelector('use[href="#volume-high"]');
const volume = document.getElementById('volume');
const currentTime = document.getElementById('current-time');
const totalTime = document.getElementById('total-time');
const playbackAnimation = document.getElementById('playback-animation');
const fullscreenButton = document.getElementById('fullscreen-button');
const pipButton = document.getElementById('pip-button')

function formatTime (timeInSeconds) {
  const result = new Date(timeInSeconds * 1000).toISOString().substr(11, 8);

  return {
    hours: result.substr(0, 2),
    minutes: result.substr(3, 2),
    seconds: result.substr(6, 2),
  };
};

function updateVolumeIcon() {
  volumeIcons.forEach(icon => {
    icon.classList.add('hidden');
  });

  volumeButton.setAttribute('data-title', 'Mute (m)')

  if (video.muted || video.volume === 0) {
    volumeMute.classList.remove('hidden');
    volumeButton.setAttribute('data-title', 'Unmute (m)')
  } else if (video.volume > 0 && video.volume <= 0.5) {
    volumeLow.classList.remove('hidden');
  } else {
    volumeHigh.classList.remove('hidden');
  }
}

function togglePlay(event) {
  if (video.paused || video.ended) {
    video.play();
  } else {
    video.pause();
  }
}

function hideControls() {
  if (video.paused) {
    return;
  }

  videoControls.classList.add('hide');
}

function showControls() {
  videoControls.classList.remove('hide');
}

function animatePlayback() {
    playbackAnimation.animate([
      {
        opacity: 0.6,
        transform: "scale(1)",
      },
      {
        opacity: 0,
        transform: "scale(1.3)",
      }
    ], {
      duration: 500,
    });
}

function updatePlayButton(event) {
  playbackIcons.forEach(icon => icon.classList.toggle('hidden'));

  if (video.paused) {
    playButton.setAttribute('data-title', 'Play (k)')
  } else {
    playButton.setAttribute('data-title', 'Pause (k)')
  }
}

function toggleMute() {
  video.muted = !video.muted;

  if (video.muted) {
    volume.setAttribute('data-mute', volume.value);
    volume.value = 0;
  } else {
    volume.value = volume.dataset.mute;
  }
}

function updateFullScreenButton() {
  const fullscreenIcons = document.querySelectorAll('.js-fullscreen-button use');
  fullscreenIcons.forEach(icon => icon.classList.toggle('hidden'));

  if (document.fullscreenElement) {
    fullscreenButton.setAttribute('data-title', 'Exit full screen (f)')
  } else {
    fullscreenButton.setAttribute('data-title', 'Full screen (f)')
  }
}

function toggleFullScreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    videoContainer.requestFullscreen();
  }
}

function updateVolume() {
  if (video.muted) {
    video.muted = false;
  }

  video.volume = volume.value;
}

function updatePlayback() {
  const dataPosition = event.target.dataset.position;
  video.currentTime = dataPosition;
  progressBar.value = dataPosition;
  seek.value = dataPosition;
  progressBar.value = dataPosition;
}

function initializeVideo() {
  const videoDuration = Math.round(video.duration);
  seek.setAttribute('max', videoDuration);
  progressBar.setAttribute('max', videoDuration);
  const duration = formatTime(videoDuration);
  totalTime.innerText = `${duration.minutes}:${duration.seconds}`;
  totalTime.setAttribute('datetime', `${duration.minutes}m ${duration.seconds}s`)
}

function updateProgress() {
  if (!progressBar.getAttribute('max')) {
    progressBar.setAttribute('max', video.duration);
  }
  seek.value = Math.floor(video.currentTime);
  progressBar.value = Math.floor(video.currentTime);
}

function updateCurrentTime() {
  const duration = formatTime(Math.round(video.currentTime));
  currentTime.innerText = `${duration.minutes}:${duration.seconds}`;
  currentTime.setAttribute('datetime', `${duration.minutes}m ${duration.seconds}s`)
}

function updateSeekTooltip(event) {
  const hoverTime = (event.offsetX / event.target.clientWidth) * parseInt(event.target.getAttribute('max'), 10);
  seek.setAttribute('data-position', hoverTime)
  const t = formatTime(hoverTime);
  seekTooltip.textContent = `${t.minutes}:${t.seconds}`;
  const rect = video.getBoundingClientRect();
  seekTooltip.style.left = `${event.pageX - rect.left}px`;
}

function togglePip() {
  if (video !== document.pictureInPictureElement) {
    pipButton.disabled = true;
    return video.requestPictureInPicture()
      .catch(console.error)
      .finally(() => pipButton.disabled = false);
  }

  document.exitPictureInPicture();
}

function keyboardShortcuts(event) {
  const { key } = event;
  switch(key) {
    case 'k':
      togglePlay();
      animatePlayback();
      if (video.paused) {
        showControls();
      } else {
        setTimeout(() => {
          hideControls();
        }, 2000);
      }
      break;
    case 'm':
      toggleMute();
      break;
    case 'f':
      toggleFullScreen();
      break;
    case 'p':
      togglePip();
      break;
  }
}

playButton.onclick = togglePlay;
volumeButton.onclick = toggleMute;
fullscreenButton.onclick = toggleFullScreen;
pipButton.onclick = togglePip;

videoContainer.onfullscreenchange = updateFullScreenButton;

volume.oninput = updateVolume;

video.onloadedmetadata = initializeVideo;
video.onplay = updatePlayButton;
video.onpause = updatePlayButton;
video.onvolumechange = updateVolumeIcon;
video.onmouseenter = showControls;
video.onmouseover = showControls;
video.onmouseleave = hideControls;
video.ontimeupdate = () => {
  updateProgress();
  updateCurrentTime();
};
video.onclick = () => {
  togglePlay()
  animatePlayback();
};

videoControls.onmouseleave = hideControls;
videoControls.onmouseover = showControls;

seek.oninput = updatePlayback;
seek.onmousemove = updateSeekTooltip;

document.onkeyup = keyboardShortcuts;

document.addEventListener('DOMContentLoaded', () => {
  if (!('pictureInPictureEnabled' in document)) {
    pipButton.classList.add('hidden');
  }
});
