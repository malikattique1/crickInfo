
const fs = require('fs');
const { exit } = require('process');
const puppeteer = require("puppeteer");
let pageScraping = false; /* set scraping to false */


const searchGoogle = async (searchQuery) => {
    if (pageScraping == true) return; /* check if already scraping page */
    let browser, page;
    let pageUrl = 'https://www.espncricinfo.com/live-cricket-score';
   // await page.screenshot({path: 'example.png'});
    try {
        pageScraping = true; /* set scraping to true */
        const browser = await puppeteer.launch({
            executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            ignoreHTTPSErrors: true,
            headless: false,
            devtools: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
            // args: ['--no-sandbox', '--disable-setuid-sandbox', '--proxy-server=128.199.154.45:8080']
          });
        page = await browser.newPage();
        await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForSelector('div.ds-text-compact-xxs', { visible: true, timeout: 6000 });
        // let example= await page.evaluate('document.querySelector("span.styleNumber").getAttribute("data-Color")')
        let searchResults = await page.evaluate (() => {
            // let allLiveMatches0 = document.body.querySelector('div.adSlot').nextSibling;
            // let allLiveMatches = allLiveMatches0.querySelector('div > div > div.ds-block').outerHTML;
            // let allLiveMatches = allLiveMatches0.querySelector('div:nth-child(4)').outerHTML;
            let allLiveMatches = document.body.querySelector('div.ds-mb-4 > div > div').nextSibling.querySelectorAll('div.ds-flex-wrap > div.ds-border-line');
            // return allLiveMatches;
            scrapeItems = [];
            allLiveMatches.forEach (item => {
                // let overs = '3';
                try {
                    let team1 = item.querySelector('p.ds-font-bold').innerText;
                    // let team2 = item.querySelector("img[src='https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_80/lsci/db/PICTURES/CMS/313100/313129.logo.png']").nextSibling.innerText;
                    // let Runs = item.querySelector('strong.ds-text-ui-typo-mid').nextSibling.innerText;
                    let overs = item.querySelector('span.ds-text-compact-xs').innerText;
                    let description = item.querySelector('p.ds-text-tight-s').innerText;
                    
                    scrapeItems.push (
                        {
                            team1: team1,
                            // team2: team2,
                            // Runs: Runs,
                            overs: overs,
                            description: description
                            
                        });
                    } catch (err) { console.log(err)}
                });
                let items = {
                    "liveMatches": scrapeItems,
                };
                return items;
            });
            console.log (searchResults);
            fs.writeFileSync("data.json", JSON.stringify(searchResults), function(err) {
                if(err) {
                    return console.log(err);
                }
                return console.log ( "The data has been scraped and saved successfully! View it at './data.json'");
            });
            // var getResults=fs.readFileSync("data.json","UTF8", function(err, data) {
            // });
            // console.log(getResults)
            var getResults = fs.readFileSync("data.json").toString();
            console.log(getResults)
            // const resultsinobj = JSON.parse(getResults);
            // console.log(resultsinobj)
            
            
        } catch (err) {
            console.log(err.message);
        } finally {
            if (browser) { /* check if browser is open befor trying to close */
            await browser.close();
            console.log('closing browser');
            
        }
        pageScraping = false; /* set scraping to false again */
        await setTimeout(searchGoogle, 5000); /* wait 5 seconds befor re-scraping */
    }
    // return searchResults;
}
setTimeout(searchGoogle, 5000); /* start scraping */
module.exports = searchGoogle;