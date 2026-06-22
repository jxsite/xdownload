const TOOL_URL = "https://x-downloader.com/";

const statusEl = document.querySelector("#status");
const copyLinkButton = document.querySelector("#copy-link");
const openToolButton = document.querySelector("#open-tool");

let currentPostUrl = "";

init();

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id || !isSupportedPage(tab.url)) {
    setStatus("Open an X/Twitter post with a video.", false);
    return;
  }

  try {
    const state = await chrome.tabs.sendMessage(tab.id, { type: "scan-active-post" });
    currentPostUrl = state?.postUrl || tab.url;

    if (state?.videoCount > 0) {
      const direct = state.directMediaCount > 0 ? "Direct download is available on the page." : "Use the free downloader fallback for this post.";
      setStatus(`${state.videoCount} video found. ${direct}`, true);
      return;
    }

    setStatus("No video detected on this X/Twitter page.", true);
  } catch {
    currentPostUrl = tab.url;
    setStatus("Refresh the X/Twitter page, then try again.", true);
  }
}

copyLinkButton.addEventListener("click", async () => {
  if (!currentPostUrl) {
    return;
  }

  await navigator.clipboard.writeText(currentPostUrl);
  copyLinkButton.textContent = "Copied";
  window.setTimeout(() => {
    copyLinkButton.textContent = "Copy post link";
  }, 1200);
});

openToolButton.addEventListener("click", () => {
  const url = currentPostUrl ? `${TOOL_URL}?url=${encodeURIComponent(currentPostUrl)}` : TOOL_URL;
  chrome.tabs.create({ url });
});

function isSupportedPage(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname === "x.com" || parsed.hostname === "twitter.com";
  } catch {
    return false;
  }
}

function setStatus(text, enabled) {
  statusEl.textContent = text;
  copyLinkButton.disabled = !enabled;
  openToolButton.disabled = !enabled;
}
