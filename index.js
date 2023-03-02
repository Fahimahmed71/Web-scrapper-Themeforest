const express = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs");
// const XLSX = require("xlsx");

const app = express();
const cors = require("cors");
const port = 3000;

app.use(cors());

// const workbook = XLSX.utils.book_new();

// puppeteer
async function run() {
  const browser = await puppeteer.launch({ headless: false, slowMo: 200 });
  const page = await browser.newPage();
  await page.goto(
    "https://themeforest.net/category/wordpress?sort=sales#content"
  );

  for (let i = 0; i < 60; i++) {
    let data = await page.evaluate(() => {
      let itemGridDivs = document.querySelectorAll(
        ".search-item_cards_container_component__list .shared-item_cards-card_component__root"
      );
      let scrapData = [];
      itemGridDivs.forEach((e) => {
        let title = e.querySelector("h3").innerText;

        let userName = e.querySelector(
          ".shared-item_cards-author_category_component__root a"
        ).innerText;

        let links = e.querySelector(
          ".shared-item_cards-author_category_component__root a"
        ).href;
        scrapData.push({ title, userName, links });
      });
      return scrapData;
    });

    let dataAsText = "";
    data.forEach((e) => {
      dataAsText += `${e.title} \n ${e.userName} \n ${e.links} \n \n`;
    });
    console.log(dataAsText);

    fs.appendFileSync("test.txt", dataAsText);

    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight);
    });
    await page.waitForSelector("ul li");
    await page.click(".search-controls-pagination_nav_component__arrowRight");
  }
  await browser.close();
}

run();

// server
app.get("/", (req, res) => {
  res.send("Server Running");
});

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
