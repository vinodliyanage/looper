/**
 * due to security restrictions imposed by browser vendors, user interaction is required in order copy/cut to work.
 * A simulated click event using JavaScript does not work as this would enable clipboard poisoning.
 */

let id = null;

chrome.action.setBadgeBackgroundColor({ color: "#ffc107" });

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    urls: [],
  });
});

let index = -1;
chrome.commands.onCommand.addListener(async (command) => {
  const { urls } = await chrome.storage.local.get("urls");
  if (!urls.length) return;

  switch (command) {
    case "next-url":
      index++, (index %= urls.length);
      ({ id } = await chrome.tabs.update(id, {
        active: true,
        url: urls[index],
      }));
      break;
    case "prev-url":
      index--, index < 0 && (index = urls.length - 1);
      ({ id } = await chrome.tabs.update(id, {
        active: true,
        url: urls[index],
      }));
      break;
    case "remove-url":
      urls.splice(index, 1);
      await chrome.storage.local.set({ urls });
      break;
    case "export-urls":
      let [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      chrome.scripting.executeScript({
        target: {
          tabId: tab.id,
        },
        func: (urls) => {
          const isCopied = copyToClipboard();
          if (isCopied) return;

          const template = document.createElement("template");
          template.innerHTML = `
              <div class="container">
                <div class="wrapper">
                  <img src="${chrome.runtime.getURL(
                    "images/clickme.gif"
                  )}" alt="click me" />
                  <h2>Click Anyware</h2>
                  <h4>
                    due to security restrictions imposed by browser vendors, 
                    user interaction is required in order copy to the clipboard.
                  </h4>
                  <h6>
                    Hey, next time, just click somewhere on the webpage 
                    before you use the copy-to-clipboard shortcut.
                  </h6>
                </div>
              </div>

              <div class="backdrop"></div>
                  
              <style>
                  * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
                  }
                  
                  .container {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    box-shadow: rgb(17 17 26 / 10%) 0px 4px 16px, rgb(17 17 26 / 5%) 0px 8px 32px;
                    transform: translate(-50%, -50%);
                    padding: 12px;
                    border-radius: 8px;
                    z-index: 2147483647;
                    background: rgb(255, 255, 255);
                    width: 350px;
                    overflow: hidden;
                  }
                  
                  .wrapper {
                    display: flex;
                    gap: 8px;
                    flex-direction: column;
                    text-align: center;
                  }
            
                  img {
                    width: 100%;
                    object-fit: cover;
                    border-radius: 8px 8px 0 0;
                  }
            
                  h2 {
                    text-transform: uppercase;
                    font-size: 1.2rem;
                    color: #000;
                  }
            
                  h4 {
                    font-weight: 500;
                    font-size: 1rem;
                    color: #230e78;
                  }
          
                  h6 {
                    font-weight: 400;
                    color: #000;
                    font-size: 0.8rem;
                    line-height: 1.5;
                  }

                  .backdrop {
                    position: fixed;
                    width: 100vw;
                    height: 100vh;
                    background: #000;
                    opacity: 0.5;
                    z-index: 2147483646;
                    top: 0;
                    left: 0;
                  }
              </style>
            `;

          const clone = template.content.cloneNode(true);

          const shadowContainer = document.createElement("div");

          const root = shadowContainer.attachShadow({ mode: "closed" });
          root.append(clone);

          document.addEventListener("click", handleClick);
          document.body.append(shadowContainer);

          function handleClick() {
            copyToClipboard();
            root.removeEventListener("click", handleClick);
            shadowContainer.remove();
          }

          function copyToClipboard() {
            const copyFrom = document.createElement("textarea");
            copyFrom.textContent = urls.join("\n");
            document.body.appendChild(copyFrom);
            copyFrom.select();
            const isCopied = document.execCommand("copy");
            copyFrom.blur();
            document.body.removeChild(copyFrom);
            return isCopied;
          }
        },
        args: [urls],
      });
      break;
  }
  chrome.action.setBadgeText({ text: String(index + 1) });
});
