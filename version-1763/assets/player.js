(function () {
  function initMoviePlayer(streamUrl) {
    var video = document.getElementById("moviePlayer");
    var layer = document.querySelector("[data-player-overlay]");
    if (!video || !streamUrl) {
      return;
    }

    var attached = false;
    var hls = null;

    function attachStream() {
      if (attached) {
        return;
      }
      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        return;
      }

      video.src = streamUrl;
    }

    function startPlayback() {
      attachStream();
      if (layer) {
        layer.classList.add("is-hidden");
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          video.controls = true;
        });
      }
    }

    if (layer) {
      layer.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener("play", function () {
      if (layer) {
        layer.classList.add("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
