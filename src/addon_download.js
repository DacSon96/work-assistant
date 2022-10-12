import $ from './jquery-2.2.3.min';

var addon = {};
$.get(chrome.runtime.getURL("modal_download.html"), function (data) {
    var html = $.parseHTML(data);
    addon.toolbar = html;
});
export {addon};
