'use strict';

import $ from './jquery-2.2.3.min';
import { tool } from './tools';
import { tmall } from "./tmall";
import { taobao } from "./taobao";
import { cn1688 } from "./1688";
import { addon } from './addon_download';
import { notion } from './notion';

import * as JSZip from 'jszip';
import JSZipUtils from 'jszip-utils';
import FileSaver from 'file-saver';
const pjson = require('../config.json');
var site;

function start() {
  var siteName = tool.getSiteName();
  tool.checkVersion();
  switch (siteName) {
    case "TAOBAO":
      site = new taobao();
      site.initEvent();
      break;
    case "TMALL":
      break;
    case "cn1688":
      site = new cn1688();
      site.initEvent();
      break;
    default:
      return false;
  }
}
// Chuyển hướng trang nếu đăng nhập xong
redirectLoginSuccess();
function redirectLoginSuccess() {
  const href = window.location.href;
  if (href.includes('https://stream-upload.taobao.com/')) {
    window.location.href = 'https://1688.com';
  }
}
// Lấy base64 của ảnh từ local storage
getDataBase64FromLocal();
$(document).ready(function () {
  start();
  $('body').on('click', function () {
    setTimeout(function () {
      addSearch();
    }, 1000)
  })
  setTimeout(function () {
    let check = $('#baxia-dialog-content').attr('src');
    check = check + '';
    if (check.includes('login.taobao')) {
      location.reload();
    }
  }, 1000)
  // $('head').append(`<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
  // <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
  // `)
  $('head').append(`<link rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
   `)
  setTimeout(function () {
    addSearch();
    const href = window.location.href;
    if (href.includes('detail.1688.com')) {
      showIconDownload();
    }
  }, 2000)
  setTimeout(function () {
    $(window).scroll(function () {
      addSearch();
    });
  }, 1000);
  $("body").click(function () {
    $('.np-popup-show').hide().removeClass("active");
    select = 0;
    mouseleave();
  });
});

function showIconDownload() {
  $('#J_AliPriceInjected').remove();
  const html = `
  <div id="btn-download" class="e-btn-detail" style="width: 1200px; margin: 0px auto; padding: 20px 0px 0px;">
    <div class="e-base ap-base--ltr ap-theme--dark skiptranslate">
      <div class="e-pdptoolbar">
        <div class="e-pdptoolbar__item">
          <div class="e-pdptoolbar-cta" >
            <i class="fa fa-download" ></i>Tải ảnh
          </div>
        </div>
    </div>
  </div>
  `;
  $('div[class*=pc-layout-two-columns] #btn-download').remove();
  $('div[class*=pc-layout-two-columns]').prepend(html).ready(function () {
    $('.e-pdptoolbar__item').unbind();
    $('.e-pdptoolbar__item').on('click', function () {
      // downloadZip()
      $('body').last().append(addon.toolbar).ready(function () {
        $('a.close-popup').unbind();
        $('#download-all').unbind();
        setTimeout(function () {
          $('a.close-popup').on('click', function () {
            $('#chipo-model').remove();
          });
        }, 1000)
        $('#download-all').on('click', function () {
          downloadZip();
        });
        showAll();
      });
    });
  });
}

async function showAll() {
  let urls = await getUrls();
  urls = await getDetailVideo(urls);
  $('div.row-cp.draw-product-item').empty();
  for (let i = 0; i < urls.length; i++) {
    let element = null;
    if (urls[i].includes('-tps-48-48.png')) {
      continue;
    }
    // Kiểm tra xem có video không
    if ((urls[i] + '').includes('{')) {
      let json = JSON.parse(urls[i]);
      let converUrl = json['coverUrl'];
      let videoUrl = json['videoUrl'];
      let jsons = json['videoUrls'];
      // check xem co nhiều link video không
      if (jsons + '' !== 'undefined') {
        videoUrl = ` data-src1="` + jsons['ios'] + `" data-src2="` + jsons['android'] + `"`;
      } else if (videoUrl + '' !== 'undefined') {
        videoUrl = ` data-src="` + videoUrl + `"`;
      }
      else if (videoUrl !== 'undefined') {
        continue;
      }
      element = `
          <div class="i-play-video" style="
              top: 28%;
          ">
              <i class="fa fa-play-circle-o" style="
              font-size: 74px;
          "></i>
          </div>
          <img
          class="image-img video-img"
          src="` + converUrl + `"
          width="170"
          ` + videoUrl + `
          height="170"
          style="height: 170px; border-radius: 8px; object-fit: contain"
        />
        <div class="round-cb">
                  <input type="checkbox" ` + videoUrl + ` id="item-` + i + `" />
                  <label for="item-` + i + `"></label>
                </div>
        `;

    } else {
      element = `
      <img
              class="image-img"
              src="` + urls[i] + `"
              width="170"
              height="170"
              style="height: 170px; border-radius: 8px; object-fit: contain"
            />
            <div class="round-cb">
              <input type="checkbox" data-src="` + urls[i] + `" id="item-` + i + `" />
              <label for="item-` + i + `"></label>
            </div>
      `;
    }
    $('div.row-cp.draw-product-item').append(`
      <div class="col col-6 pd10">
        <div style="width: 170px;height: 180px;align-items: center;justify-content: center;position: relative;">
          <div class="image" style="width: 170px; height: 170px">
            ` + element + `
          </div>
        </div>
      </div>
      `).ready(function () {
      const lstSet = new Set();
      if (lstSet.size < 1) {
        $('#download-checked').prop('disabled', true);
      }
      $('.image input').unbind();
      $('.image input').on('click', function () {
        if ($(this).is(":checked")) {
          $('.image .round-cb input[type=checkbox]:checked').each(function () {
            let src = $(this).attr('data-src');
            if (src === undefined) {
              if ($(this).attr('data-src1') !== undefined) {
                lstSet.add($(this).attr('data-src1'));
              }
              if ($(this).attr('data-src2') !== undefined) {
                lstSet.add($(this).attr('data-src2'));
              }
            } else {
              lstSet.add(src);
            }

          });
        } else {
          let src = $(this).attr('data-src');
          if (src === undefined) {
            if ($(this).attr('data-src1') !== undefined) {
              lstSet.delete($(this).attr('data-src1'));
            }
            if ($(this).attr('data-src2') !== undefined) {
              lstSet.delete($(this).attr('data-src2'));
            }
          } else {
            lstSet.delete(src);
          }

        }
        if (lstSet.size < 1) {
          $('#download-checked').prop('disabled', true);
        }
        if (lstSet.size > 0) {
          $('#download-checked').prop('disabled', false);
        }
      });
      $('#download-checked').unbind();
      $('#download-checked').on('click', function () {
        downloadCheckedZip(Array.from(lstSet))
      });
    });
  }
}

async function downloadCheckedZip(urls) {
  const promises = [];
  for (let i = 0; i < urls.length; i++) {
    if (urls[i] !== undefined) {
      promises.push(getImage(urls[i]));
    }
  }
  const folder = pjson.product + '-' + $('.title-text').text();
  Promise.all(promises).then((files) => {
    const zip = new JSZip();
    // var zip = zip.folder(folder);
    files.map((fileInfo) => {
      zip.file(fileInfo.filename, fileInfo.file, {binary: true});
    });

    zip.generateAsync({type: 'blob'}).then(function (content) {
      FileSaver.saveAs(content, folder + '.zip');
    });
  });
}

function getImage(url) {
  return new Promise((resolve, reject) => {
    JSZipUtils.getBinaryContent(url, (err, data) => {
      const fileInfo = url.split('/').slice(-2);
      resolve({
        file: data,
        folder: fileInfo[0],
        filename: fileInfo[1],
      });
    });
  });
}

function getUrlsFeedback() {
  let div = $('.next-tabs-tab-inner');

}

async function getUrlsVideo(urls) {
  $('script').each(function (sc) {
    let js = $(this).html();
    if (js.includes('window.__GLOBAL_DADA')) {
      let video = js.substr(js.indexOf('video'));
      video = video.substr(video.indexOf('{'), video.indexOf('}'))
      video = video.substr(0, video.indexOf('}') + 1)
      let json = JSON.parse(video);
      let src = json['videoUrl'];
      urls.push(src);
    }
  });
  return await urls;
}

async function getDetailVideo(urls) {
  $('script').each(function (sc) {
    let js = $(this).html();
    if (js.includes('window.__GLOBAL_DADA')) {
      let video = js.substr(js.indexOf('video'));
      // if(video.indexOf('{') !== '-1'){
      //   wirelessVideo
      // }
      video = video.substr(video.indexOf('{'), video.indexOf('}'))
      video = video.substr(0, video.indexOf('}') + 1)
      try {
        let json = JSON.parse(video);
        urls.push(video);
      } catch (error) {
        let video = js.substr(js.indexOf('wirelessVideo'));
        // if(video.indexOf('{') !== '-1'){
        //   wirelessVideo
        // }
        video = video.substr(video.indexOf('{'), video.indexOf('}'))
        video = video.substr(0, video.indexOf('}') + 2);
        video = video.replaceAll("\\", "");
        let json = JSON.parse(video);
        urls.push(video);
      }
    }
  });
  return await urls;
}

async function getUrls() {
  // image
  let urls = [];
  const lstImage = $('.img-list-wrapper img');
  for (let i = 0; i < lstImage.length; i++) {
    let src = $(lstImage[i]).attr("src");
    if (src !== undefined) {
      urls.push(src);
    }
  }
  return await urls;
}

async function downloadZip() {
  let urls = await getUrls();
  urls = await getUrlsVideo(urls);
  const promises = [];
  for (let i = 0; i < urls.length; i++) {
    if (urls[i] !== undefined) {
      promises.push(getImage(urls[i]));
    }
  }
  const folder = pjson.product + '-' + $('.title-text').text();
  Promise.all(promises).then((files) => {
    const zip = new JSZip();
    // var zip = zip.folder(folder);
    files.map((fileInfo) => {
      zip.file(fileInfo.filename, fileInfo.file, {binary: true});
    });

    zip.generateAsync({type: 'blob'}).then(function (content) {
      FileSaver.saveAs(content, folder + '.zip');
    });
  });
}

function mouseenter(element, isDiv) {
  const url = window.location.href;
  if (url.includes('1688') || url.includes('lazada.vn')) {
    mouseleave();
  }
  // element.parents('a').unbind();
  const width = element.width();
  element.parent().removeClass('wXeWr');
  let offset = element.offset();
  let left;
  try {
    left = offset.left;
  } catch (error) {
    left = element.closest('a').offset().left;
  }
  let height = element.outerHeight();
  let top = parseInt(offset.top + height);
  // $('a').removeAttr('href');
  renderButton(element, top, left, isDiv, width);
}

function mouseleave() {
  $('#cp-render-btn .cp-btn-order').off('change');
  // $('#cp-render-btn').remove();
  const href = window.location.href;
  setTimeout(function () {
    if ($('a.disable') !== 'undefined') {
      const a_link = $('a.disable');
      const rev = a_link.attr('rever');
      a_link.attr('href', rev);
      a_link.removeAttr('rever');
      a_link.removeClass('disable')
    }
  }, 3000)

}

function addSearch() {

  const url = window.location.href;
  $('img').parents().find('a').unbind();
  if (url.includes('1688') || url.includes('lazada.vn')) {
    $('img').not('.rax-view.pc-home-container, img[draggable="false"], .is-video-container, .offer-desc').unbind();
    $('img').not('.rax-view.pc-home-container, img[draggable="false"], .is-video-container, .offer-desc').on({
      mouseenter: function () {
        const img = $(this).closest('a').find('img').first();
        if (img.attr('src') === $(this).attr('src') || typeof (img.attr('src')) !== 'string') {
          mouseenter($(this).parent(), false)
        }

      },
      mouseleave: function () {
        if (!url.includes('1688') && !url.includes('lazada.vn')) {
          mouseleave();
        }
      }
    });

    $('.offer-img-box').not('.rax-view.pc-home-container').unbind();
    $('.offer-img-box').not('.rax-view.pc-home-container').on({
      mouseenter: function () {
        mouseenter($(this), false)
      },
      mouseleave: function () {
        if (!url.includes('1688') && !url.includes('lazada.vn')) {
          mouseleave();
        }
      }
    });

    $('[class*="offer"]').find('.is-video-container').not('.rax-view.pc-home-container').unbind();
    $('[class*="offer"]').find('.is-video-container').not('.rax-view.pc-home-container').on({
      mouseenter: function () {
        mouseenter($(this).closest('a').find('div.offer-img'), false)
      },
      mouseleave: function () {
        if (!url.includes('1688') && !url.includes('lazada.vn')) {
          mouseleave();
        }
      }
    });

    // select div have image background
    $('div.img').not('.rax-view.pc-home-container').unbind();
    $('div.img').not('.rax-view.pc-home-container').on({
      mouseenter: function () {
        if (!$(this).find(img)) {
          mouseenter($(this), true)
        }
      },
      mouseleave: function () {
        if (!url.includes('1688')) {
          mouseleave();
        }
      }
    });

    $('div[style*="url"]').not('div.img').parent().unbind();
    $('div[style*="url"]').not('div.img').parent().on({
      mouseenter: function () {
        const src = $(this).closest('a').find('img').attr('src');
        if (typeof src !== 'string') {
          mouseenter($(this), true);
        }
        if ($(this).closest('a').find('img').first().hasClass('star')) {
          mouseenter($(this), true);
        }
        // $(this).parent().addClass('disabled-click');
      },
      mouseleave: function () {
        if (!url.includes('1688') && !url.includes('lazada.vn')) {
          mouseleave();
        }
        $(this).parent().removeClass('disabled-click');
      }
    });

    $('.top-sales-offer > a > img').not('.rax-view.pc-home-container').unbind();
    $('.top-sales-offer > a > img').not('.rax-view.pc-home-container').on({
      mouseenter: function () {
        mouseenter($(this).parent(), false)
      },
      mouseleave: function () {
        if (!url.includes('1688') && !url.includes('lazada.vn')) {
          mouseleave();
        }
      }
    });
    $('a[class*=slick-slide] >img.offer-img').not('.rax-view.pc-home-container').unbind();
    $('a[class*=slick-slide] >img.offer-img').not('.rax-view.pc-home-container').on({
      mouseenter: function () {
        mouseenter($(this).parent(), false)
      },
      mouseleave: function () {
        if (!url.includes('1688') && !url.includes('lazada.vn')) {
          mouseleave();
        }
      }
    });
  } else if (url.includes('tiki.vn')) {
    $('img').closest('picture').not('.rax-view.pc-home-container').unbind();
    $('img').closest('picture').not('.rax-view.pc-home-container').on({
      mouseenter: function () {
        mouseenter($(this), false)
      },
      mouseleave: function () {
        if (!url.includes('1688') && !url.includes('lazada.vn')) {
          mouseleave();
        }
      }
    });

    // $('.container img').closest('picture').parent().not('.rax-view.pc-home-container').unbind();
    // $('.container img').closest('picture').parent().not('.rax-view.pc-home-container').on({
    //   mouseenter: function () {
    //     if(!$(this).find('picture').hasClass('webpimg-container')){
    //       mouseenter($(this), false)
    //     }
    //     // mouseenter($(this), false)
    //   },
    //   mouseleave: function () {
    //     if (!url.includes('1688') && !url.includes('lazada.vn')) {
    //       mouseleave();
    //     }
    //   }
    // });

    $('div[class*="thumbnail"] > img').parent().not('.rax-view.pc-home-container, picture').unbind();
    $('div[class*="thumbnail"] > img').parent().not('.rax-view.pc-home-container, picture').on({
      mouseenter: function () {
        const picture = $(this).closest('a').find('picture');
        if (picture.length < 1) {
          mouseenter($(this), false)
        }
      },
      mouseleave: function () {
        if (!url.includes('1688') && !url.includes('lazada.vn')) {
          mouseleave();
        }
      }
    });
  } else if (url.includes('shopee.vn')) {
    $('a[data-sqe*="link"] > div >div').unbind();
    $('a[data-sqe*="link"] > div >div').on({
      mouseenter: function () {
        mouseenter($(this), false);
        $('#gobiz-m24-search-image').remove();
      },
      mouseleave: function () {
        if (!url.includes('1688') && !url.includes('lazada.vn')) {
          mouseleave();
        }
      }
    });
    $('div[style*="background-image"]').parent().unbind();
    $('div[style*="background-image"]').parent().on({
      mouseenter: function () {
        mouseenter($(this), true)
      },
      mouseleave: function () {
        if (!url.includes('1688') && !url.includes('lazada.vn')) {
          mouseleave();
        }
      }
    });

  } else {
    $('img').parent().not('.rax-view.pc-home-container').unbind();
    $('img').parent().not('.rax-view.pc-home-container').on({
      mouseenter: function () {
        mouseenter($(this), false)
      },
      mouseleave: function () {
        if (!url.includes('1688') && !url.includes('lazada.vn')) {
          mouseleave();
        }
      }
    });

    $('div[style*="background-image"]').not('div.img').parent().unbind();
    $('div[style*="background-image"]').not('div.img').parent().on({
      mouseenter: function () {
        mouseenter($(this), true);
        // $(this).parent().addClass('disabled-click');
      },
      mouseleave: function () {
        if (!url.includes('1688') && !url.includes('lazada.vn')) {
          mouseleave();
        }
        $(this).parent().removeClass('disabled-click');
      }
    });

    $('div[style*="background: url"]').not('div.img').parent().unbind();
    $('div[style*="background: url"]').not('div.img').parent().on({
      mouseenter: function () {
        mouseenter($(this), true);
        // $(this).parent().addClass('disabled-click');
      },
      mouseleave: function () {
        if (!url.includes('1688') && !url.includes('lazada.vn')) {
          mouseleave();
        }
        $(this).parent().removeClass('disabled-click');
      }
    });
  }
  // Lấy tất cả thẻ có mask
  $('[class*="ask"]').parent().find('img').parent().unbind();
  $('[class*="ask"]').parent().find('img').parent().on({
    mouseenter: function () {
      mouseenter($(this), false)
    },
    mouseleave: function () {
      if (!url.includes('1688') && !url.includes('lazada.vn')) {
        mouseleave();
      }
    }
  });
}

function getDataBase64FromLocal() {
  const href = window.location.href;
  if (href.includes('1688.com') && !href.includes('page.1688.com/api/upload.api')) {
    chrome.storage.local.get('base64Data', function (result) {
      if (Object.keys(result).length !== 0) {
        // xóa dataBase64 ra khỏi local
        chrome.storage.local.remove(["base64Data"]);
        appendPopup(result);
      }
    });
  }
}
function removeDataBase64FromLocal() {
  chrome.storage.local.get('base64Data', function (result) {
    if (Object.keys(result).length !== 0) {
      // remove dataBase64in local
      chrome.storage.local.remove(["base64Data"]);
    }
  });
}

function appendPopup(base64Data) {
  let img = JSON.stringify(base64Data);
  img = img.substr(img.indexOf('data:'));
  $('body').last().append(`
  <div id="overlay">
    <div class="overlay-popup">
      <button type="button" class="close close-popup" data-dismiss="chipoModal" aria-label="Close" ></button>
      <div class="overlay-popup-header">
        <div class="icon-prefix">
        </div>
        <p id="icon-load">
          Đang tìm kiếm ảnh
          <i class="fa fa-spinner fa-spin"></i>
        </p>
      </div>

      <div class="popup-image">
        <div class="popup-image-left">
          <img src="` + img + `"/>
        </div>
      </div>
    </div>
  </div>
  `).ready(function () {
    $('button.close-popup').on('click', function () {
      $('#overlay').remove();
    });
  });
  uploadImageLocal(base64Data['base64Data'], false);
}

async function uploadImageLocal(dataBase64) {
  // await b64toBlob(dataBase64, contentType);
  const blob = await dataURItoBlob(dataBase64);
  await uploadImageV2(blob)
}

function dataURItoBlob(dataURI) {
  var byteString = atob(dataURI.split(',')[1]);
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);

  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  var blob = new Blob([ab], {type: mimeString});

  return blob;
}

function subImgInDiv(style) {
  if (style.indexOf('background-image') != '-1') {
    style = style.substr(style.indexOf('background-image'));
    style = style.substr(style.indexOf('url'));
    const href = window.location.href;
    if (indexOfTypeImg(style) !== undefined && !href.includes('facebook')) {
      style = style.substr(style.indexOf('"') + 1, indexOfTypeImg(style) - 1);
    } else {
      style = style.substr(style.indexOf('"') + 1);
      style = style.substr(0, style.indexOf('"'));
    }
  } else {
    style = style.substr(style.indexOf('background: '));
    style = style.substr(style.indexOf('url'));
    const href = window.location.href;

    if (indexOfTypeImg(style) !== undefined && !href.includes('facebook')) {
      if (style.indexOf('"') != '-1') {
        style = style.substr(style.indexOf('"') + 1, indexOfTypeSrc(style));
      }
      if (style.indexOf('\'') != '-1') {
        style = style.substr(style.indexOf('\'') + 1, indexOfTypeImg(style) - 1);
      }
      if (style.startsWith('//')) {
        style = 'https:' + style;
      }
    } else {
      style = style.substr(style.indexOf('"') + 1);
      style = style.substr(0, style.indexOf('"'));
    }
  }
  return style;
}

function showPopupWaiting(element) {
  let src = '';
  let val = 'Đang tìm kiếm ảnh';
  let classes = '';
  let hide = '';
  if ((typeof element) !== 'string') {
    const img = element.find('img');
    if (element.attr('style') !== undefined) {
      src = subImgInDiv(element.attr('style'))
    } else {
      src = img.attr('src')
    }
  } else {
    src = element;
  }
  if (text + '' !== 'undefined') {
    val = text;
    src = '';
    classes = ' hide-icon';
    // hide = ' hide-div-important';
  }

  $('body').last().append(`
        <div id="overlay">
          <div class="overlay-popup">
            <button type="button" class="close close-popup" data-dismiss="chipoModal" aria-label="Close" ></button>
            <div class="overlay-popup-header `+ classes + `">
              <div class="`+ hide + ` icon-prefix">
              </div>
              <p id="icon-load">
                `+ val + `
                <i class="fa fa-spinner fa-spin"></i>
              </p>
            </div>
            <div class="popup-image">
              <div class="popup-image-left">
                <img style="padding: 5%;" src="` + src + `"/>
              </div>
            </div>
          </div>
        </div>
        `).ready(function () {
    $('button.close-popup').on('click', function () {
      $('#overlay').remove();
    })
  });
}

function renderButton(img, top, left, isDiv, width) {
  let isExists = $('#cp-render-btn');
  if (isExists !== 'undefined') {
    isExists.remove();
  }
  let stylel = 'style="';

  const href = window.location.href;
  let classes = ' ';
  if (href.includes('s.1688.com')) {
    classes = 'cp-1688-s';
  }
  // if (href.includes('lazada.vn')) {
  //   classes += 'p-top-10';
  // }
  if (img.width() > 500) {
    stylel += 'top: 90%';
  }
  if (img.parent().find('img').length > 1) {
    stylel = ' style="top: unset; margin-bottom: 3%; ';
  }

  // Kiểm tra xem sản phẩm có thuộc dạng gợi ý ở trang lazada không
  let isPlus = false;
  if (img.closest('a').parent().attr('class') === 'recommend-product-item'
    || href.includes('sale.1688.com')
  ) {
    // tính toán khoảng cách đến top và left
    const offset = img.offset();
    let left = offset.left + (img.width() / 2) - 15;
    stylel += 'top: ' + parseInt(offset.top + img.height() - 44) + 'px;left: ' + left + 'px; ' + 'max-width: 0%; ';
    isPlus = true;
  }
  if (img.closest('a').parent().attr('class') === 'top-sales-offer'
    || img.closest('a').find('img').attr('class') === 'desc-img-loaded'
    || img.closest('a').find('img').attr('class') === 'recommend-item-img'
    || img.closest('a').hasClass('item-content')
    || img.closest('a').find('div[class="img"]').not('[style*="url"]').is('[class=img]')
  ) {
    // tính toán khoảng cách đến top và left

    if (img.closest('a').find('div[class="is-video-container"]').attr('class') === undefined) {
      const p_left = (img.closest('a').find('img').width() / 2) - 15;
      const p_top = (img.closest('a').find('img').height()) - 15;
      if (img.closest('a').find('img').attr('class') === 'desc-img-loaded') {
        isPlus = true;
      }
      stylel = ' style="top: unset;top: unset;max-width: 0%;left: unset;right: unset;padding-left: ' + p_left + 'px;    bottom: unset;padding-top: ' + p_top + 'px';
    }

  }

  // }
  // if (img.attr('class') === 'item-content') {
  //   const offset = img.offset();
  //   let left = offset.left + 386;
  //   stylel += 'top: 150px;';
  //   isPlus = false;
  // }

  /*
  <button class="btn-order" type="button" class="">
        <span role="img" aria-label="search" />
          <svg viewBox="64 64 896 896" focusable="false" data-icon="search" width="1em" height="1em"
            fill="currentColor" aria-hidden="true">
              <path d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0011.6 0l43.6-43.5a8.2 8.2 0 000-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z"></path>
          </svg>
        </span>
      </button>
  */
  stylel = stylel + '"';
  img.prepend(`<div id="cp-render-btn"` + stylel + ` class="cp-render-div chipo-wrapper-as ` + classes + `">
  <div class="cp-e-circle cp-inline cp-btn-order">
  <i class="fa fa-search cp-p-7 cl-white cp-i-fz"></i>
</div>
</div>`).ready(function () {
    $('#cp-render-btn .cp-btn-order').on({
      click: function () {
        const url = window.location.href;

        if (img.prop('tagName').toLowerCase() === 'picture') {
          img.parent().addClass('disable');
        } else {
          img.addClass('disable');
        }
        $('.cp-popup-show').remove();
        let i = img.closest('a');
        const href = i.attr('href');
        i.removeAttr('href');
        i.attr('rever', href);
        i.addClass('disable');
        let height = parseInt($(this).width() * 30) / 100;
        left = height + left;
        $('.cp-popup-show').remove();
        let position = 'absolute';
        let top = 'top: ';
        // if (url.includes('lazada.vn') || url.includes('tiki.vn')) {
        //   top += '100%';
        // }
        let width_parent = img.parent().parent().width();
        if (width < 190) {
          width = 190;
        }
        left = 0;
        if (width > 190 && !url.includes('www.1688.com')) {
          left = (parseInt(width_parent - 190) / 2);
          width = 190 + 'px';
        } else {
          width = 'unset';
        }
        let ml = 'margin-left: ';
        // kiem tra xem có đang ở thẻ ngoài của img không
        const img_check = img.parent().find('.offer-img-box');
        if (img_check.attr('class') + '' !== 'undefined' && img_check + '' !== 'link') {
          position = 'unset';
        }
        if (url.includes('taobao.com')) {
          left = 'unset';
          position = 'unset';
          ml += '12px'
        }
        let fz = 'font-size: ';
        if (url.includes('detail.1688.com')) {
          width = '100%';
          top += '1%';
          fz += '11px';

        }

        let e_offset = img.offset();

        let img_prev = null;
        if (img.height() == '0') {
          try {
            img_prev = img.closest('.thumbnail');
            e_offset = img_prev.offset();
            left = e_offset.left;
          } catch (error) {
            img_prev = img.parent();
            e_offset = img_prev.offset();
            left = e_offset.left;
          }
          e_offset = (e_offset.top + img_prev.height());
        } else {
          img_prev = img;
          if (img.width() > 500) {
            img = img.parent();
            img_prev = img;
          }
          left = e_offset.left;
          e_offset = (e_offset.top + img.height());
        }

        if (img.height() < 30) {
          try {
            let height_new = img.find('img');
            e_offset = (height_new.offset().top + height_new.height());
          } catch (error) {
          }
        }
        e_offset += 10;
        // Tinh khoảng cách từ nút search đến top
        if (url.includes('lazada')) {
          const btn = $('#cp-render-btn');
          e_offset = (btn.offset().top + btn.height()) + 10;
        }
        // kiểm tra xem có cần công thêm 44 không
        if (isPlus) {
          e_offset = e_offset + 44;
        }
        top = 'top: ' + e_offset + 'px';
        // if (url.includes('lazada.vn') || url.includes('tiki.vn')) {
        //   top = 'top: 100%; ';
        // }
        width = '226px';
        position = 'absolute';
        let cal_width = img_prev.width();
        // tính khoảng cách căn lề trái
        if (cal_width < 226) {
          left = (left - ((226 - cal_width) / 2));
        }
        if (cal_width > 226) {
          left = (left + ((cal_width - 226) / 2));
        }
        if (url.includes('s.1688.com')) {
          left += 6;
        }
        ml = 'margin-left: unset;';
        let html = `
        <div style="position: absolute; top: 0px; left: 0px; width: 100%;">
          <div>
            <div class="cp-popup-show" style="z-index: 99999999;`+ ml + `;left: ` + left + `px;position: ` + position + `;width: ` + width + `;` + top + `">
            <div>
              <div class="cp--popover custom-popup cp--popover-placement-bottom ">
                  <div class="cp--popover-content">
                    <div class="cp--popover-arrow">
                      <span class="cp--popover-arrow-content"></span>
                    </div>
                    <div class="cp--popover-inner" role="tooltip">
                      <div class="close-popup-option">
                        <i class="fa fa-close"></i>
                      </div>
                      <div  style="`+ fz + `;" class="cp-ff cp--popover-title f-size-1">
                        Tìm kiếm sản phẩm trên</div>
                      <div class="cp--popover-inner-content">
                        <div>
                          <div id="cp-search-taobao" class="cp-search-option cursor-pointer cp-custom-popup-item hide-div f-size-1">Taobao.com</div>
                          <div id="cp-search-1688" class="cp-search-option cursor-pointer cp-custom-popup-item f-size-1">1688.com</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
          `;
        // chọn trang tìm kiếm 1688 or taobao
        let href_curent = window.location.href;
        // if (href_curent.includes('detail.1688.com')) {
        //   let append = img.find('img');
        // }
        // tắt sự kiện click ảnh trên trang shopee
        if (url.includes('shopee.vn')) {
          if ($('div.disable').hasClass('disable')) {
            appendOnly(html, img, i, isDiv)
            return false;
          }
        }
        $(html).insertAfter('body').ready(function () {
          $('.close-popup-option').on('click', function () {
            $('.cp-popup-show').remove();
          })
          $('.cp-search-option').on('click', function () {
            // disabled click
            img.parent().addClass('disable');
            let href_curent = window.location.href;
            if (href_curent.includes('1688.com')) {
              // showPopupWaiting(img);
              $('.cp-popup-show').remove();
            }
            let i = img.closest('a');
            const href = i.attr('href');
            i.removeAttr('href');
            i.attr('rever', href);
            i.addClass('disable');

            let option = $(this).attr('id');
            // lấy src của ảnh
            let file = null;
            if (!isDiv) {
              file = img.find('img');
              if (file.attr('src') === 'undefined') {
                showPopupWaiting(file, 'Không thể lấy ảnh. Vui lòng thử lại!');
                return;
              }
            } else {

              file = img.attr('style');
              if (file === undefined) {
                file = img.parent().find('div[style*="background-image"]').attr('style');
              }
              if (file === undefined) {
                file = img.parent().find('div[style*="background: url"]').attr('style');
              }
              if (href_curent.includes('shopee.vn')) {
                file = img.find('div[style*="background-image"]').attr('style');
                fetchData(subImgInDiv(file));
                showPopupWaiting(file, 'Không thể lấy ảnh. Vui lòng thử lại!');
                return;
              }
            }
            if (option.includes('1688')) {
              let web = window.location.href;
              // Kiểm tra xem có đang ở trang 1688 không? Nếu không có thì chuyển trang rồi mới tìm
              // if (!web.includes('1688.com')) {
              let nameImage = file;
              if (typeof file === 'object') {
                nameImage = file.attr('src');
              } else {
                try {
                  if (file.includes('background-image') || file.includes('background: url')) {
                    nameImage = subImgInDiv(file);
                  }
                } catch (error) {
                  showPopupWaiting('', 'Không thể lấy ảnh. Vui lòng thử lại');
                  return
                }
              }
              nameImage = prefixRemoveSizeImg(nameImage);
              // Nếu bắt đầu bằng chữ
              // if (regexMatchImg(nameImage[0]) && web.includes('1688.com')) {
              //   searchByImage(nameImage);
              // } else {
              //   uploadImage(file, true, isDiv, true);
              // }
              // Nếu bắt đầu bằng O1CN
              // if (regexMatchImg(nameImag
              if (startsWidth(nameImage)) {
                if (web.includes('1688.com')
                  || web.includes('taobao.com')
                  || web.includes('tmall.com')) {
                  // removeDataBase64FromLocal();
                  searchByImage(nameImage);
                }
              } else {
                uploadImage(file, true, isDiv, true);
              }
              // uploadImage(file, true, isDiv, true);
              // console.log('d1: ')
              // window.open("https://www.1688.com/", "_blank");
              // } else {
              //   let nameImage = file;
              //   if (typeof file === 'object') {
              //     nameImage = file.attr('src');
              //   } else {
              //     try {
              //       if (file.includes('background-image')) {
              //         nameImage = subImgInDiv(file);
              //       }
              //     } catch (error) {
              //       showPopupWaiting('', 'Không thể lấy ảnh. Vui lòng thử lại');
              //       return
              //     }
              //   }
              //   nameImage = prefixRemoveSizeImg(nameImage);
              //   if (regexMatchImg(nameImage[0])) {
              //     searchByImage(nameImage);
              //   } else {
              //     uploadImage(file, true, isDiv, true);
              //   }
              // }

            }
            if (option.includes('taobao')) {
              window.open("https://world.taobao.com/", "_blank");
            }
            if (i.hasClass('disable')) {
              return false;
            };
            if ($('div.disable').hasClass('disable')) {
              return false;
            }
          })
        });
        if (i.hasClass('disable')) {
          return false;
        }
        // tắt sự kiện click ảnh trên trang chi tiết
        if ($('div.disable').hasClass('disable')) {
          return false;
        }
        if ($('a.disable').hasClass('disable')) {
          return false;
        }
      }
    })
  });
}
function appendOnly(html, img, i, isDiv) {
  $(html).insertAfter('body').ready(function () {
    $('.close-popup-option').on('click', function () {
      $('.cp-popup-show').remove();
    })
    $('.cp-search-option').on('click', function () {
      // disabled click
      img.parent().addClass('disable');
      let href_curent = window.location.href;
      if (href_curent.includes('1688.com')) {
        showPopupWaiting(img);
        $('.cp-popup-show').remove();
      }
      let i = img.closest('a');
      const href = i.attr('href');
      i.removeAttr('href');
      i.attr('rever', href);
      i.addClass('disable');

      // lấy src của ảnh
      let file = null;
      let src = '';
      if (!isDiv) {
        file = img.find('img');
        src = file.attr('src');
      } else {
        file = img.attr('style');
        file = img.find('div[style*="background-image"]').attr('style');
        if (img.closest('a').find('div[style*="background-image"]').length > 1) {
          file = img.closest('a').find('div[style*="background-image"]').last().attr('style');
        }
        src = subImgInDiv(file);
      }
      if (href_curent.includes('shopee.vn')) {
        src = src.replaceAll('http://', 'https://');
        getBase64FromUrl(src).then(async (dataBase64) => {
          if ((typeof dataBase64) === 'string') {
            // Lưu file vào local storage
            // check xem có base64Data chưa? nếu có thì xóa đi
            removeDataBase64FromLocal();
            chrome.storage.local.set({ ['base64Data']: dataBase64 });

            // Mở trang 1688.com
            window.open("https://www.1688.com/", "_blank");
          }
        });
        // showPopupWaiting(src);
        return;
      }
    })
  });
  // img.parents().find('div[style*="image"]').on('click', function () {
  //   $(this).off('click')
  // });
  // img.parents().find('img').on('click', function () {
  //   $(this).off('click')
  // })
  if (i.hasClass('disable')) {
    return false;
  }
}
function getAlignOffset(region, align) {
  var V = align.charAt(0);
  var H = align.charAt(1);
  var w = region.width;
  var h = region.height;
  var x = region.left;
  var y = region.top;

  if (V === 'c') {
    y += h / 2;
  } else if (V === 'b') {
    y += h;
  }

  if (H === 'c') {
    x += w / 2;
  } else if (H === 'r') {
    x += w;
  }

  return {
    left: x,
    top: y
  };
}
function startsWidth(str) {
  return str.startsWith('O1CN');
}
function regexMatchImg(character) {
  let pattern = /[^0-9]/g;
  let result = character.match(pattern);
  if (result + ''.length < 1) {
    return false;
  } else {
    return true;
  }
  // nếu ảnh bắt đầu bằng O1CN thì trả về true

}
function getTypeImg(img) {
  if (img.includes('.jpg')) {
    return '.jpg';
  }
  if (img.includes('.png')) {
    return '.png';
  }

  if (img.includes('.gif')) {
    return '.gif';
  }
  if (img.includes('.webp')) {
    return '.webp';
  }
}
function prefixRemoveSizeImg(image) {
  image = image.substr(image.lastIndexOf('/') + 1);
  let name = image.substr(0, image.indexOf('.'));
  image = image.replaceAll(name, '');
  let type = getTypeImg(image);
  return name + type;
}
async function fetchData(url) {
  const res = await fetch(url);
  // const contentType = res.headers.get('Content-Type');
  const raw = await res.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(raw);
    reader.onloadend = () => {
      const base64data = reader.result;
      resolve(base64data);
    }
  });
}
const getBase64FromUrl = async (src) => {
  let data;
  // src = src.substr(0, indexOfTypeSrc(src))
  try {
    const url = window.location.href;
    // fix lấy ảnh trên youtube
    if (url.includes('youtube')) {
      src = src.substr(0, indexOfTypeSrc(src))
    }
    data = await fetch(src);
  } catch (error) {
    showPopupWaiting('', 'Không thể lấy ảnh do chính sách CORS!')
    return;
  }
  const blob = await data.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result;
      resolve(base64data);
    }
  });
}
async function subStrImg(style) {
  try {
    style = await style.substr(style.indexOf('url'), style.indexOf(';') - 1);
    style = await style.substr(style.indexOf('"') + 1, indexOfTypeImg(style) - 1);
  } catch (error) {
    // console.log('Không thể đọc ảnh');
  }
  return await style;
}

function indexOfTypeImg(url) {
  if (url.includes('.jpg')) {
    return url.indexOf('.jpg');
  }
  if (url.includes('.png')) {
    return url.indexOf('.png');
  }

  if (url.includes('.gif')) {
    return url.indexOf('.gif');
  }
  if (url.includes('.webp')) {
    return url.indexOf('.webp');
  }
}

function indexOfTypeSrc(src) {
  if (src.includes('.jpg')) {
    return src.indexOf('.jpg') + 4;
  }
  if (src.includes('.png')) {
    return src.indexOf('.png') + 4;
  }

  if (src.includes('.gif')) {
    return src.indexOf('.gif') + 4;
  }
  if (src.includes('.webp')) {
    return src.indexOf('.webp') + 5;
  }
}
function searchByImage(nameImage) {
  const href = `https://s.1688.com/youyuan/index.htm?tab=imageSearch&imageAddress=` + nameImage + `&spm=a26352.13672862.searchbox.input`;
  window.open(href, '_blank');
}
function repalceWebp(src) {
  if (src.includes('.webp')) {
    src = src.substr(0, indexOfTypeSrc(src));
    return src;
  }
  return src;
}
async function uploadImage(img, isSave, isDiv, isOpen) {
  let src = null;
  if (!isDiv) {
    src = img.attr('src');
    // src = src.substr(0, indexOfTypeSrc(src));
  } else {
    src = await subStrImg(img);
  }
  if (src.includes('undefined')) {
    src = src.substr(0, src.indexOf("_undefined"));
  }
  src = await repalceWebp(src);
  await getBase64FromUrl(src).then(async (dataBase64) => {
    if ((typeof dataBase64) === 'string') {
      const blob = await dataURItoBlob(dataBase64);
      if (isSave) {
        // check xem có base64Data chưa? nếu có thì xóa đi
        removeDataBase64FromLocal();
        chrome.storage.local.set({ ['base64Data']: dataBase64 });
        if (isOpen) {
          window.open("https://www.1688.com/", "_blank");
        }
      } else {
        await uploadImageV2(blob)
      }
    }
  });
};

function uploadImageV2(blob) {
  var myHeaders = new Headers();
  myHeaders.append("referer", "https://s.1688.com/");
  myHeaders.append("origin", "https://s.1688.com");
  var formdata = new FormData();
  formdata.append("file", blob, pjson.product + ".jpg");
  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: formdata,
    redirect: 'follow',
    credentials: 'include'
  };
  fetch("https://stream-upload.taobao.com/api/upload.api?appkey=1688search&folderId=0&_input_charset=utf-8&useGtrSessionFilter=false&_bx-v=1.1.20", requestOptions).then(function (response) {
    return response.json();
  }).then(function (result) {
    var fileName = result && result.object ? result.object.url : '';
    var resUrls = fileName.split('/');
    if (!fileName) {
      // console.log("Vui lòng đăng nhập và tìm kiếm lại.");
      $('#overlay').remove();
      $('body').last().append(notion.toolbar).ready(function () {
        $('.close-popup').unbind();
        $('#download-all').unbind();
        $('.message-log-show').text('Vui lòng đăng nhập và tìm kiếm lại.');
        $('.close-popup').on('click', function () {
          $('#chipo-model').remove();
        });
      });
      // mở tab đăng nhập ra
      if ((result.url).includes('login.taobao.com')) {
        // window.open(result.url);
        window.location.href = result.url;
      }
      // Mở tab kéo xe
      if ((result.url).includes('x5secdata')) {
        window.open('https://page.1688.com' + result.url, '_blank');
      }
      // window.open(result.url, '_blank');
    } else {
      setTimeout(function () {
        window.location.href = "https://s.1688.com/youyuan/index.htm?tab=imageSearch&imageAddress=".concat(resUrls[resUrls.length - 1], "&spm=a26352.13672862.searchbox.input");
      }, 2000)
    }
  })["catch"](function (error) {
    // console.log('error', error);
  });
}
