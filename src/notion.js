import $ from './jquery-2.2.3.min';

var notion = {};
$.get(chrome.runtime.getURL("dialog_notication.html"), function (data) {
    var html = $.parseHTML(data);
    notion.toolbar = html;
});
export {notion};
