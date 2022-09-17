var requestData = {
  headers: {},
  url: null,
};

let isHeadersListen;
let isInjectListen;

async function injectStyles(response) {
  if (response.type == "REQUEST_COMPLETE") {
    isInjectListen = chrome.runtime.onMessage.hasListener(injectStyles);
    if (isInjectListen) {
      // console.log("is inject styles listen: " + isInjectListen);
      // console.log("remove listener inject styles");
      chrome.runtime.onMessage.removeListener(injectStyles);
    }

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
  }
}

function getHeaders(details) {
  if (details.method == "GET" && /friends\?limit/.test(details.url)) {
    details.requestHeaders.forEach((item) => {
      requestData.headers[item.name] = item.value;
    });
    requestData.url = details.url;

    isHeadersListen =
      chrome.webRequest.onBeforeSendHeaders.hasListener(getHeaders);

    if (isHeadersListen) {
      // console.log("is header listen: " + isHeadersListen);
      chrome.webRequest.onBeforeSendHeaders.removeListener(getHeaders);
    }

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
  try {
    let friends = document.querySelectorAll(
      ".b-profile__content__item .b-friend__content"
    );
    let intervalId = setInterval(() => {
      // console.log("try find friends");
      // console.log(list);
      friends = document.querySelectorAll(
        ".b-profile__content__item .b-friend__content"
      );
      if (friends.length > 0) {
        clearInterval(intervalId);
        friends.forEach((item, i) => {
          if (list[i].subscribedBy) {
            item.querySelector(".b-username > .g-user-name").style.color =
              "green";
          }
        });
      }
    }, 300);
  } catch (err) {
    console.log(err);
  }
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  let url = changeInfo.url;
  if (url && !/https:\/\/onlyfans\.com\/(my\/|bookmarks)/.test(url)) {
    // console.log(changeInfo.url);

    isHeadersListen =
      chrome.webRequest.onBeforeSendHeaders.hasListener(getHeaders);

    // console.log("has listener (getHeaders): " + isHeadersListen);

    if (!isHeadersListen) {
      // console.log("Устанавливаю listener getHeaders");
      chrome.webRequest.onBeforeSendHeaders.addListener(
        getHeaders,
        { urls: ["https://onlyfans.com/*"] },
        ["requestHeaders"]
      );
    }

    isInjectListen = chrome.runtime.onMessage.hasListener(injectStyles);
    // console.log("has listener (inject styles): " + isInjectListen);
    if (!isInjectListen) {
      // console.log("Устанавливаю listener inject styles");
      chrome.runtime.onMessage.addListener(injectStyles);
    }
  }
});
