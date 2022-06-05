const cp = require('child_process');
const screenshot = require('screenshot-desktop');
const https = require("https");
const open = require("open");
const fs = require('fs');
const request = require('sync-request');
const cheerio = require('cheerio');

const url_index = "https://www.scggqx.com/sc/shouye/index.html";
const city = "德阳";
const url_list = "https://d.scggqx.com/WarningSignal/YjxhDetails.jsp?warncityname=" + encodeURI(city);
const url_crawl = "https://d.scggqx.com/WarningSignal/WarnSignalPage.jsp?warncityname=" + encodeURI(city);
const url_detail_root = "https://d.scggqx.com/WarningSignal/";
var image_dir = "";

//截图效果不理想,则修改以下两个延时
const init_delay = 5000;  //打开第一个页面后的截图延时，单位：ms（等待网页加载完毕）
const screenshot_delay = 3500;  //打开后续页面后的截图延时，单位：ms（等待网页加载完毕）



function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}


async function main() {
    init();

    open(url_index, { wait: true });
    await sleep(init_delay);
    screenshot({ filename: image_dir + 'index.png' });

    open(url_list, { wait: true });
    await sleep(screenshot_delay);
    screenshot({ filename: image_dir + 'list.png' });


    try {
        let links = crawlList();
        
        for (let i = 0; i < links.length; i++) {
            let url = links[i];
            open(url, { wait: true });
            await sleep(screenshot_delay);
            screenshot({ filename: image_dir + 'details' + i + '.png' });
        }
        open('finish.html', { wait: true });
        cp.exec("explorer " +__dirname+"\\"+image_dir.replace('/',''));
        await sleep(screenshot_delay);
        process.exit(1);
    }
    catch(err){     
        open('error.html', { wait: true });
    }
    
}

main();


function init() {
    let now = new Date();
    let dir = "截图_" + (now.getMonth() + 1) + '-' + now.getDate() + '/';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    image_dir = dir;

}

function crawlList() {
    let res, html = "", $;

    res = request('GET', url_crawl);
    html = res.getBody().toString();
    if (html != "") {
        $ = cheerio.load(html);
        html = $("script[language='Javascript']").text().split('"')[1];
        $ = cheerio.load(html);
        let links = [];
        $("a").each(function (ele, i) {
            links.push(url_detail_root + $(this).attr('href'));
        });
        return links;
    }


}