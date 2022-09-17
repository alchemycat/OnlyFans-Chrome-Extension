window.onload = () => {
  function sendRequest(message) {
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
          if (body.length > 0) {
            chrome.runtime.sendMessage({
              type: "REQUEST_COMPLETE",
              friends: body,
            });
          } else {
            console.log("Нету данных о друзьях");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  chrome.runtime.onMessage.addListener(sendRequest);
};
