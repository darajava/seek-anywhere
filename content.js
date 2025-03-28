console.log("Content script loaded!");

const modifyInstagramUI = () => {
  chrome.storage.sync.get("instagram", ({ instagram }) => {
    const enabled = instagram !== false;

    if (!window.location.hostname.includes("instagram.com")) return;

    document.querySelectorAll('[aria-label="Play"]').forEach((element) => {
      if (element.parentElement?.parentElement) {
        element.parentElement.parentElement.style.display = enabled
          ? "none"
          : "block";
      }
    });

    document
      .querySelectorAll('[data-visualcompletion="ignore"]')
      .forEach(
        (element) => (element.style.display = enabled ? "none" : "block")
      );

    document.querySelectorAll("video").forEach((element) => {
      element.controls = enabled ? true : false;
      element.controlsList = "nofullscreen";
      element.loop = true;
      element.muted = false;
      element.onmouseup = () => (element.muted = false);
      element.onseeked = () => (element.muted = false);
      element.onended = () => (element.muted = false);
      element.onclick = () =>
        element.paused ? element.play() : element.pause();
    });
  });
};

const modifyFacebookUI = () => {
  chrome.storage.sync.get("facebook", ({ facebook }) => {
    const enabled = facebook !== false;

    if (!window.location.hostname.includes("facebook.com")) return;

    document
      .querySelectorAll(
        "[data-visualcompletion='ignore-dynamic'] .__fb-dark-mode"
      )
      .forEach(
        (element) => (element.style.display = enabled ? "none" : "block")
      );

    document.querySelectorAll("video").forEach((video) => {
      video.controls = enabled ? true : false;
      video.loop = true;
      video.controlsList = "nofullscreen";
      video.muted = false;

      video.onmouseup = () => (video.muted = false);
      video.onseeked = () => (video.muted = false);
      video.onended = () => (video.muted = false);

      const parent = video.parentElement;
      if (parent) {
        Array.from(parent.children).forEach((sibling) => {
          if (sibling !== video && sibling.hasAttribute("data-instancekey")) {
            sibling.style.display = enabled ? "none" : "block";
          }
        });
      }
    });
  });
};

const modifyYoutubeUI = () => {
  chrome.storage.sync.get(
    [
      "youtube",
      "youtube-hide-title",
      "youtube-hide-channel",
      "youtube-hide-description",
      "youtube-hide-track",
      "youtube-hide-search-button",
    ],
    (settings) => {
      if (!window.location.hostname.includes("youtube.com")) return;

      const enabled = settings.youtube !== false;
      const hideChannel = settings["youtube-hide-channel"] !== false;
      const hideTitle = settings["youtube-hide-title"] !== false;
      const hideDescription = settings["youtube-hide-description"] !== false;
      const hideTrack = settings["youtube-hide-track"] !== false;
      const hideSearchButton = settings["youtube-hide-search-button"] !== false;

      const isShorts = window.location.pathname.includes("shorts");

      if (!isShorts) {
        document.querySelectorAll("video").forEach((video) => {
          video.controls = false;
        });
        return;
      }

      // Top controls
      document.querySelectorAll("ytd-shorts-player-controls").forEach((el) => {
        el.style.display = enabled ? "none" : "flex";
      });

      // Red progress bar
      document
        .querySelectorAll("yt-progress-bar")
        .forEach((el) => (el.style.display = enabled ? "none" : "flex"));

      // Audio track info
      document
        .querySelectorAll("reel-sound-metadata-view-model")
        .forEach((el) => {
          el.style.display = hideTrack ? "none" : "block";
        });

      // Weird suggested search button
      document
        .querySelectorAll("yt-shorts-suggested-action-view-model")
        .forEach((el) => {
          el.style.display = hideSearchButton ? "none" : "block";
        });

      // Metapanel: includes title, description, channel
      // document
      //   .querySelectorAll("yt-reel-metapanel-view-model")
      //   .forEach((el) => {
      //     if (hideChannel) {
      //     el.parentElement.parentElement.style.pointerEvents = "none";
      //     el.style.pointerEvents = "none";
      //   });

      // Channel (handle + subscribe)
      document
        .querySelectorAll("yt-reel-channel-bar-view-model")
        .forEach((el) => {
          el.style.display = hideChannel ? "none" : "flex";
        });

      // title
      document
        .querySelectorAll("yt-shorts-video-title-view-model")
        .forEach((el) => {
          console.log(
            "I am setting display to",
            hideTitle ? "none" : "initial"
          );
          el.style.display = hideTitle ? "none" : "initial";
        });

      // description
      document
        .querySelectorAll("yt-reel-multi-format-link-view-model")
        .forEach((el) => {
          el.style.display = hideDescription ? "none" : "block";
        });

      // Metadata container at bottom (handle position/border/etc)
      document
        .querySelectorAll(
          ".metadata-container.ytd-reel-player-overlay-renderer"
        )
        .forEach((el) => {
          el.style.position = "relative";
          el.style.bottom = "40px";
          el.style.backgroundImage = "none";
        });

      document.querySelectorAll("video").forEach((video) => {
        video.controls = enabled;
        if (video.attributes["data-no-fullscreen"]) {
          video.attributes["data-no-fullscreen"].value = "false";
        }
        video.style.objectFit = "contain";
      });
    }
  );
};

window.onload = () => {
  setInterval(modifyInstagramUI, 500);
  setInterval(modifyFacebookUI, 500);
  setInterval(modifyYoutubeUI, 500);
};
