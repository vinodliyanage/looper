const log = (...data) => console.log("ex-", ...data);

const urlsInput = document.getElementById("urls");
const copy = document.getElementById("copy");
const download = document.getElementById("download");

urlsInput.addEventListener("input", handleUrls);
document.addEventListener("DOMContentLoaded", handleLoad);
copy.addEventListener("click", handleCopy);
download.addEventListener("click", handleDownload);

async function handleLoad() {
  const { urls } = await chrome.storage.local.get("urls");
  urlsInput.value = urls.join("\n");
}

function handleUrls() {
  const urlRe =
    /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;

  const urls = urlsInput.value
    .trim()
    .split("\n")
    .filter((url) => urlRe.test(url));

  chrome.storage.local.set({ urls });
}

function handleCopy() {
  navigator.clipboard
    .writeText(urlsInput.value.trim())
    .then(() => setNotification())
    .catch(() => setNotification(true));
}

function handleDownload() {
  const link = document.createElement("a");
  const blobUrl = URL.createObjectURL(
    new Blob([urlsInput.value.trim()], { type: "text/plain" })
  );
  link.href = blobUrl;
  link.download = "urls.txt";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function setNotification(failed = false) {
  const message = failed ? "An error occur!" : "Successfully Copied!";

  const span = document.createElement("span");
  span.textContent = message;

  const spanStyle = `
    border-radius: 50px;
    background: ${
      failed
        ? "rgb(220 38 38)"
        : "linear-gradient(to bottom right, #9333ea, #3b82f6)"
    };
    box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
    top: 15px;
    color: #fff;
    display: block;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    font-size: 14px;
    font-weight: 600;
    padding: 5px 10px;
    position: absolute;
    right: 10px;
    text-transform: capitalize;
    z-index: 999999;`;

  span.setAttribute("style", spanStyle);

  document.body.style.position = "relative";
  document.body.appendChild(span);

  const timeout = setTimeout(() => {
    document.body.style.position = "unset";
    span.remove();
    clearTimeout(timeout);
  }, 2000);
}
