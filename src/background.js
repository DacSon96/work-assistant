'use strict';

const pjson = require('../config.json');
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    let init = {
      method: request.method ? request.method : "GET",
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'version': pjson.version,
        'partner': pjson.product,
        'tool': 'assistant'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer'
    };
    if (request.method !== 'GET') {
      init.body = request.data ? JSON.stringify(request.data) : {};
    }

    let timeoutSecond = 60000;
    timeout(timeoutSecond, fetch(request.url, init).then(response => response.json()))
      .then(response => sendResponse(response))

    function timeout(milliseconds, promise) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error("TIMEOUT"))
        }, milliseconds)
        promise.then(resolve, reject)
      })
    }

    return true;
  }
);

