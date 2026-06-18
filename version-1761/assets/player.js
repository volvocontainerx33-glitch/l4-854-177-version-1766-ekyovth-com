function setupMoviePlayer(source) {
  const video = document.getElementById('movie-player');
  const cover = document.getElementById('player-cover');

  if (!video || !source) {
    return;
  }

  let attached = false;

  const bindSource = function () {
    if (attached) {
      return;
    }
    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    video.src = source;
  };

  const play = function () {
    bindSource();
    if (cover) {
      cover.classList.add('hidden');
    }
    const promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  };

  bindSource();

  if (cover) {
    cover.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('hidden');
    }
  });
}
