import {tool} from './tools';

var taobao = function () {
  var self = this;

  var hub = {};

  self.initEvent = function () {
    var s = document.createElement('script');
    s.src = chrome.runtime.getURL('script.js');
    s.onload = function () {
      this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
  }

  document.addEventListener('ear-TAOBAO-e', function (e) {
    hub = e.detail.obj;
    if (e.detail.item) {
      tool.saveItem(e.detail.item, 'TAOBAO');
    }
  });
};
export {taobao}
