import puppeteer, { Browser, Page } from "puppeteer";
import fs from "fs";
import { promisify } from "util";

const writeFileAsync = promisify(fs.writeFile);

interface ScrapedItem {
    [key: string]: any;
}

export const isPagination = async (page: Page): Promise<boolean |null> => {
    return page.evaluate(() => {
        const activeLi = document.querySelector(".pagination li.active");
        const nextLi = activeLi ? (activeLi.nextElementSibling as HTMLLIElement) : null;
        return nextLi && !nextLi.classList.contains("disabled") && !!nextLi.querySelector("a");
    });
};

export const newPaginatedUrl = async (page: Page, baseUrl: string): Promise<string> => {
    const currentPageUrl = await page.evaluate(() => {
        const activeLi = document.querySelector(".pagination li.active");
        if (!activeLi) throw new Error("activeLi is null");
        const nextLi = activeLi.nextElementSibling as HTMLLIElement;
        return nextLi.querySelector("a")?.href || "";
    });
    return new URL(currentPageUrl, baseUrl).href;
};

async function scrapeData(page: Page, baseUrl: string): Promise<ScrapedItem> {
    let results: ScrapedItem = {};
    let i = 0;
    let currentPageUrl: string = baseUrl;
    let hasNextPage: boolean = true;

    while (hasNextPage) {
        console.log("Page index:", i);
        console.log("Current page URL:", currentPageUrl);
        await page.goto(currentPageUrl, { waitUntil: "networkidle2" });

        const currentPageData: ScrapedItem = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll("[data-b-item-id]"));
            const pageResults: ScrapedItem = {};
            items.forEach((item) => {
                const itemId: string = item.getAttribute("data-b-item-id") || "";
                const jsonData: string = item.getAttribute("data-b-for-cart") || "{}";
                pageResults[itemId] = JSON.parse(jsonData);
            });
            return pageResults;
        });

        results = { ...results, ...currentPageData };

        const isPaginated = await isPagination(page);
        if (isPaginated && i < 1000) {
            const newPage = await newPaginatedUrl(page, baseUrl);
            if (newPage === currentPageUrl) {
                hasNextPage = false;
            }
            currentPageUrl = newPage;
            i++;
        } else {
            hasNextPage = false;
        }
    }

    return results;
}

async function scrapeAll(urls: string[]): Promise<void> {
    const browser = await puppeteer.launch({ headless: true });
    const pages: Promise<ScrapedItem>[] = [];

    // Create a page pool for parallel processing
    for (const url of urls) {
        const page = await browser.newPage();
        
        pages.push(
            scrapeData(page, url).then((data) => {
                console.log("done", url)
                page.close(); // Close page when done
                return data;
            })
        );
    }

    const results = await Promise.all(pages);
    let allResults: ScrapedItem = {};
    results.forEach((result) => {
        allResults = { ...allResults, ...result };
    });

    await writeFileAsync("../outputBarbora.json", JSON.stringify(allResults, null, 2), "utf-8");
    await browser.close();
    console.log("All scraping tasks complete.");
}

// List of URLs to scrape
const urls = [
    "https://www.barbora.lt/gerimai",
    "https://barbora.lt/darzoves-ir-vaisiai",
    "https://www.barbora.lt/pieno-gaminiai-ir-kiausiniai",
    "https://www.barbora.lt/duonos-gaminiai-ir-konditerija",
    "https://www.barbora.lt/mesa-zuvis-ir-kulinarija",
    "https://www.barbora.lt/bakaleja",
    "https://www.barbora.lt/kudikiu-ir-vaiku-prekes",
    "https://www.barbora.lt/kosmetika-ir-higiena",
    "https://www.barbora.lt/svaros-ir-gyvunu-prekes",
    "https://www.barbora.lt/namai-ir-laisvalaikis",
];

scrapeAll(urls).then(() => {
    console.log("Scraping complete for all URLs.");
});
