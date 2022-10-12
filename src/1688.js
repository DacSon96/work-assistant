import {tool} from './tools';

var cn1688 = function () {
    var self = this;

    var content = {};

    self.initEvent = function () {
        var s = document.createElement('script');
        s.src = chrome.runtime.getURL('script.js');
        s.onload = function () {
            this.remove();
        };
        (document.head || document.documentElement).appendChild(s);
    }

    document.addEventListener('ear-CN1688-e', function (e) {
        content = e.detail;
        if (e.detail.dataNew) {
            tool.saveItem(e.detail.dataNew, 'CN1688');
        }
    });
};

export {cn1688};
