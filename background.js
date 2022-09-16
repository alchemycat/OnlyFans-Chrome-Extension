var requestData = {
  headers: {},
  url: null,
};

chrome.runtime.onMessage.addListener(async (response, sender) => {
  if (response.type == "REQUEST_COMPLETE") {
    const friends = response.friends;
    chrome.tabs.query({}, function (tabs) {
      tabs.forEach(async (tab) => {
        if (tab.active) {
          let id = tab.id;
          chrome.scripting.executeScript({
            target: {
              tabId: id,
            },
            func: changeStyles,
            args: [friends],
          });
        }
      });
    });

    chrome.webRequest.onBeforeSendHeaders.addListener(
      getHeaders,
      { urls: ["https://onlyfans.com/*"] },
      ["requestHeaders"]
    );
  }
});

chrome.webRequest.onBeforeSendHeaders.addListener(
  getHeaders,
  { urls: ["https://onlyfans.com/*"] },
  ["requestHeaders"]
);

function getHeaders(details) {
  if (details.method == "GET" && /friends\?limit/.test(details.url)) {
    details.requestHeaders.forEach((item) => {
      requestData.headers[item.name] = item.value;
    });
    requestData.url = details.url;

    chrome.webRequest.onBeforeSendHeaders.removeListener(getHeaders);

    chrome.tabs.query({}, function (tabs) {
      tabs.forEach(async (tab) => {
        if (tab.active) {
          let id = tab.id;

          chrome.tabs.sendMessage(id, {
            type: "REQUEST",
            url: details.url,
            body: requestData,
          });
        }
      });
    });
  }
}

function changeStyles(list) {
  let friends = document.querySelectorAll(
    ".b-profile__content__item .b-friend__content"
  );
  let intervalId = setInterval(() => {
    console.log("try find friends");
    friends = document.querySelectorAll(
      ".b-profile__content__item .b-friend__content"
    );
    if (friends.length > 0) {
      clearInterval(intervalId);
      console.log(friends);
      friends.forEach((item, i) => {
        if (list[i].subscribedBy) {
          item.querySelector(".b-username > .g-user-name").style.color =
            "green";
        }
      });
    }
  }, 300);
}
