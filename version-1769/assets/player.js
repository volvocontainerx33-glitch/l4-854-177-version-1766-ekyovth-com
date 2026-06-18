(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  function bindHls(video, source, status) {
    if (video.dataset.bound === "true") {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.dataset.bound = "true";
      status.textContent = "已使用浏览器原生 HLS 播放能力加载。";
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video.dataset.bound = "true";
      video._hlsInstance = hls;
      status.textContent = "已绑定 HLS.js 播放源，正在加载视频。";
      return;
    }

    status.textContent = "当前浏览器不支持 HLS 播放，请更换支持 HLS 的浏览器。";
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (wrapper) {
      var video = wrapper.querySelector("video[data-src]");
      var overlay = wrapper.querySelector(".play-overlay");
      var status = wrapper.querySelector("[data-player-status]");
      if (!video || !overlay || !status) {
        return;
      }

      overlay.addEventListener("click", function () {
        var source = video.getAttribute("data-src");
        bindHls(video, source, status);
        overlay.classList.add("is-hidden");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            status.textContent = "播放源已加载，请再次点击播放器开始播放。";
          });
        }
      });
    });
  }

  ready(setupPlayers);
})();
