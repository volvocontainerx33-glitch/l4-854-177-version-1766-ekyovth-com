import { H as Hls } from './hls-vendor-dru42stk.js';

function setupPlayer(shell) {
  var video = shell.querySelector('video');
  var startButton = shell.querySelector('[data-player-start]');
  var message = shell.querySelector('[data-player-message]');
  var sourceUrl = shell.dataset.videoUrl;
  var initialized = false;
  var hlsInstance = null;

  function setMessage(text) {
    if (message) {
      message.textContent = text || '';
    }
  }

  function initialize() {
    if (initialized || !video) {
      return Promise.resolve();
    }

    initialized = true;

    if (!sourceUrl) {
      setMessage('当前影片没有可用播放源。');
      return Promise.resolve();
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      return Promise.resolve();
    }

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setMessage('播放源加载失败，请检查网络或 m3u8 源是否可访问。');
          try {
            hlsInstance.destroy();
          } catch (error) {
            // Keep the page usable even if the HLS instance has already been disposed.
          }
        }
      });
      return Promise.resolve();
    }

    video.src = sourceUrl;
    setMessage('当前浏览器不支持 HLS.js，已尝试使用浏览器原生播放。');
    return Promise.resolve();
  }

  if (startButton) {
    startButton.addEventListener('click', function () {
      initialize().then(function () {
        startButton.classList.add('is-hidden');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            setMessage('浏览器阻止了自动播放，请再次点击视频控件播放。');
          });
        }
      });
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

document.querySelectorAll('.js-player').forEach(setupPlayer);
