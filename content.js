window.onload = () => {
  chrome.runtime.onMessage.addListener(async (message) => {
    if (message.type == "REQUEST") {
      fetch(message.body.url, {
        headers: message.body.headers,
        referrer: window.location.href,
        referrerPolicy: "strict-origin-when-cross-origin",
        body: null,
        method: "GET",
        mode: "cors",
        credentials: "include",
      })
        .then((res) => res.json())
        .then((body) => {
          chrome.runtime.sendMessage({
            type: "REQUEST_COMPLETE",
            friends: body,
          });
        });
    }
  });
};
