//get info from script on page (iDetailConfig and iDetailData)
var scripts = document.querySelectorAll("script"); //get all scripts
var content1688 = {};
var contentJD = {};
var obj_iDetailData = {};
var obj_iDetailConfig = {};
var obj_dataNewVer = {};
var obj_Hub = {};
var taobaoCfg = {};
for (var i = 0; i < scripts.length; i++) {
    if (scripts[i].text.includes("var iDetailData")) {
        window.eval(scripts[i].text); //run the script contain keyword
        obj_iDetailData = iDetailData;
        break;
    }
}
for (var i = 0; i < scripts.length; i++) {
    if (scripts[i].text.includes("iDetailConfig")) {
        window.eval(scripts[i].text); //run the script contain keyword
        obj_iDetailConfig = iDetailConfig;
        break;
    }
}
//new version 1688
for (var i = 0; i < scripts.length; i++) {
    if (scripts[i].text.includes("window.__INIT_DATA")) {
        window.eval(scripts[i].text); //run the script contain keyword
        obj_dataNewVer = window.__INIT_DATA;
        obj_dataNewVer.desc = window.offer_details ? window.offer_details.content : null;
        break;
    }
}
for (var i = 0; i < scripts.length; i++) {
    if (scripts[i].text.includes("pageConfig")) {
        window.eval(scripts[i].text); //run the script contain keyword
        //run the script contain keyword
        contentJD = {
            data: pageConfig.product,
        };
        break;
    }
}
for (var i = 0; i < scripts.length; i++) {
    if (scripts[i].text.includes("Hub = {};")) {
        window.eval(scripts[i].text);
        obj_Hub = Hub && Hub.config.config.sku.valItemInfo.skuMap ? Hub.config.config.sku.valItemInfo.skuMap : null;
        taobaoCfg = window.g_config;
        taobaoCfg.skuMap = obj_Hub;
        try{taobaoCfg.desc = desc;}catch(e){}
        break;
    }
}
content1688 = {config: obj_iDetailConfig, data: obj_iDetailData, dataNew: obj_dataNewVer};
document.dispatchEvent(new CustomEvent('ear-CN1688-e', {detail: content1688}));
document.dispatchEvent(new CustomEvent('ear-JD-e', {detail: contentJD}));
document.dispatchEvent(new CustomEvent('ear-TAOBAO-e', {detail: {obj: obj_Hub, item: taobaoCfg}}));
