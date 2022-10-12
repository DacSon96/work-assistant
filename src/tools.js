'use strict';

import $ from './jquery-2.2.3.min';

const pjson = require('../config.json');

/**
 * Commmon functions
 */
var tools = function () {
  var self = this;
  self.checkUrl = pjson.checkUrl;
  var pathCheck = "t/ext/check-version";
  var versionOk = true;
  var nameCk = pjson.product.toLowerCase() + "_a_ck";

  self.baseUrl = pjson.url;
  var debug = pjson.debug;
  var saveItem = "ext/saveItem";

  self.getCookie = function (name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) {
      return parts.pop().split(";").shift();
    }

  }
  self.checkVersion = function () {
    let checkV = self.getCookie(nameCk);
    if (checkV !== 'true') {
      let expired = new Date();
      expired.setHours(23);
      expired.setMinutes(59);
      expired.setSeconds(59);
      let expires = "; expires=" + expired.toUTCString();
      chrome.runtime.sendMessage({
        url: self.checkUrl + pathCheck,
        method: 'GET'
      }, function (resp) {
        if (resp.code === 'FAIL' && resp.success === false) {
          versionOk = false;
        } else {
          versionOk = true;
        }
        document.cookie = nameCk + "=" + versionOk + expires + "; path=/";
      });
    }
  }
  self.getSiteName = function () {
    var url = window.location.href;
    if (url.match(/item.taobao/) || url.match(/taobao.com\/item\//)) {
      return "TAOBAO";
    }
    if (url.match(/detail.tmall/) || url.match(/tmall.com\/item\//) || url.match(/yao.95095/)) {
      return "TMALL";
    }
    if (url.match(/detail.1688/) || url.match(/[d]+[e]+[t]+[a]+[i]+[l]+.1688/)) {
      return "cn1688";
    }
    if (url.match(/item.jd/)) {
      return "jd";
    }
    return '';
  };

  self.saveItem = function (obj, siteName) {
    debug && chrome.storage.local.clear() && console.log('Clear store data');
    if (!obj && siteName !== 'TMALL') {
      debug && console.log('Not found data yet');
      return;
    }
    if (!obj.sibRequest && siteName === 'TAOBAO') {
      debug && console.log('Not found data yet');
      return;
    }
    setTimeout(function () {
      try {
        let requestParam = "?website=xxx&itemId=yyy";
        let id = "";
        let description = "";
        if (siteName == 'TAOBAO') {
          //<editor-fold desc="TAOBAO" defaultstate="collapsed">
          id = obj.itemId;
          if (!id) {
            let path = window.location.href;
            id = path.match(/item\/(.+)\.htm/i);
            if (!id || !id.length) {
              id = path.match(/id=(.+)&?/);
            }
            id = id && id.length > 1 ? id[1] : 0;
          }

          let attrLi = $("#attributes").find('li');
          if (attrLi.length > 0) {
            let detailProp = [];
            $.each(attrLi, (i, e) => {
              detailProp.push($(e).text());
            });
            obj.detailProp = detailProp;
          }

          let jProp = $('.J_Prop');
          if (jProp.length > 0) {
            let props = [];
            $.each(jProp, (i, e) => {
              let ul = $(e).find('ul');
              let title = $(ul).attr('data-property');
              let itemPropertyOutput = {};
              itemPropertyOutput.title = title;
              itemPropertyOutput.name = title;

              let li = $(ul).find('li');
              let childPropertyOutputs = [];
              $.each(li, (j, k) => {
                let properties = $(k).attr('data-value');
                let titleProp = $(k).find('a>span').text();
                let style = $(k).find('a').attr('style');
                let img = "";
                if (style) {
                  img = style.match("(\\/\\/[^\\\\]+(jpg|jpeg|png|tiff)\\b)");
                  if (img) {
                    img = img[0];
                  }
                  img = img.replace('_30x30.jpg', '')
                  if (img.startsWith("//")) {
                    img = "https:" + img;
                  }
                }
                childPropertyOutputs.push({title: titleProp, properties: properties, image: img});
              });
              itemPropertyOutput.childPropertys = childPropertyOutputs;
              props.push(itemPropertyOutput);
            });
            obj.itemPropertys = props;
          } else {
            let offSale = $('.J_TOffSale');
            if (offSale.length > 0) {
              chrome.storage.local.set({[siteName + '_' + id]: new Date().getTime()});
              return;
            }
          }

          if (!obj.desc) {
            description = document.getElementById("J_DivItemDesc").outerHTML;
            obj.desc = description;
          }
          //</editor-fold>
        } else if (siteName === 'CN1688') {
          //<editor-fold desc="1688" defaultstate="collapsed">
          id = $('meta[name=\'b2c_auction\']').attr('content');
          if (!id) {
            let path = window.location.pathname;
            id = path.match(/offer\/(.+)\.html/i);
            id = (!id || id.length === 0) ? null : id[1];
          }

          if (!obj.desc) {
            description = document.getElementById("detailContentContainer").outerHTML;
            obj.desc = description;
          }

          obj.saga = undefined;
          obj.seed = undefined;
          obj.seedComboUris = undefined;
          obj.seedLoadedModules = undefined;
          obj.pageInfo = undefined;
          obj.modules = undefined;
          //</editor-fold>
        } else if (siteName === 'TMALL') {
          //<editor-fold desc="TMALL" defaultstate="collapsed">
          id = $('#LineZing').attr('itemid');
          if (!id) {
            let path = window.location.pathname;
            id = /item\/(.+)\.htm/i.exec(path);
            id = id[1];
          }
          if (document.getElementById('J_PromoPrice').getElementsByTagName('dd')[0].innerHTML) {
            debug && console.log('This product has promo price, can not get data');
            return;
          }
          obj.html = document.documentElement.innerHTML;
          try {
            obj.desc = desc;
          } catch (e) {
          }
          //ko day tmall len
          return;
          //</editor-fold>
        }
        chrome.storage.local.get(siteName + '_' + id, function (result) {
          if (!result || isEmptyObject(result)) {
            requestParam = requestParam.replace('xxx', siteName.toString().toUpperCase()).replace('yyy', id);
            self.sendAjax(saveItem + requestParam, 'PUT', obj, function (resp) {
              chrome.storage.local.set({[siteName + '_' + id]: new Date().getTime()});
            })
          } else {
            let expireDate = new Date().getTime() - 5 * 1000 * 60 * 60 * 24; //5 days
            if (expireDate > result[siteName + '_' + id]) {
              chrome.storage.local.remove([siteName + '_' + id]);
            }
          }
        });
      } catch (e) {
        debug && console.log(e);
      }
    }, 5000);
  }

  function isEmptyObject(obj) {
    var name;
    for (name in obj) {
      return false;
    }
    return true;
  }

  self.sendAjax = function (url, method, data, callBack) {
    chrome.runtime.sendMessage({
      url: self.baseUrl + url,
      method: method,
      data: data
    }, callBack)
  };
}

var tool = new tools();
export {tool};
