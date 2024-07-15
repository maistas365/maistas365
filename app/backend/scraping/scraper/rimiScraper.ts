import puppeteer from "puppeteer";
import fs from "fs";
import { promisify } from "util";

interface ScrapedItem {
    [key: string]: any;
}
interface ProductData {
    id: string;
    name: string;
    category: string;
    brand: string | null;
    price: number | null;
    currency: string;
    url: string;
    image: string;
    pricePer?: string | null;
}

export const isPagination = async (page: any) => {
    return await page.evaluate(() => {
        const nextArrow = document.querySelector('.pagination__list .pagination__item.-chevron a[rel="next"]');
        // Check if the next arrow exists and has a navigable link
        return nextArrow !== null;
    });
};
export const newPaginatedUrl = async (page: any, baseUrl: string) => {
    const currentPageUrl = await page.evaluate(() => {
        const nextArrow = document.querySelector('.pagination__list .pagination__item.-chevron a[rel="next"]');
        if (!nextArrow) {
            throw new Error("No next page link found.");
        }
        // Assert that nextArrow is an HTMLAnchorElement to access the href property
        return (nextArrow as HTMLAnchorElement).href;
    });
    // Resolve the absolute URL in case the href is relative
    return new URL(currentPageUrl, baseUrl).href;
};

const outputFilePath = "outputRimi.json";

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

async function scrapeList(baseUrl: string): Promise<ScrapedItem> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    let results: ScrapedItem = {};
    try {
        try {
            const existingDataString = await readFileAsync(outputFilePath, "utf-8");
            results = JSON.parse(existingDataString);
        } catch (error) {
            console.log("No existing data or read error; starting fresh.");
        }

        let currentPageUrl: string = baseUrl;
        let hasNextPage: boolean = true;
        let i = 0;

        while (hasNextPage) {
            console.log("i", i);
            console.log("currentPageUrl", currentPageUrl);
            await page.goto(currentPageUrl, { waitUntil: "networkidle2" });

            const currentPageData: ScrapedItem = await page.evaluate(() => {
                const items = Array.from(document.querySelectorAll(".js-product-container"));
                const pageResults: Record<string, ProductData> = {};
                items.forEach((item) => {
                    const itemId = item.getAttribute("data-product-code") || "Unknown ID";
                    const jsonDataString = item.getAttribute("data-gtm-eec-product") || "{}";
                    const jsonData: Partial<ProductData> = JSON.parse(jsonDataString);

                    const urlElement = item.querySelector(".card__url") as HTMLAnchorElement | null;
                    const imageElement = item.querySelector(".card__image-wrapper img") as HTMLImageElement | null;
                    const pricePer = item.querySelector(".card__price-per")?.textContent?.trim().replace(/\s+/g, " ");

                    pageResults[itemId] = {
                        id: itemId,
                        name: jsonData.name || "No name available",
                        category: jsonData.category || "No category",
                        brand: jsonData.brand || null,
                        price: jsonData.price || null,
                        currency: jsonData.currency || "No currency",
                        url: urlElement ? urlElement.href : "",
                        image: imageElement ? imageElement.src : "",
                        pricePer: pricePer,
                    };
                });
                return pageResults;
            });

            results = { ...results, ...currentPageData }; // Merge existing with new

            await writeFileAsync(outputFilePath, JSON.stringify(results, null, 2), "utf-8");
            const isPaginated = await isPagination(page); // You must define isPagination
            if (isPaginated && i < 1000) {
                const newPage = await newPaginatedUrl(page, baseUrl); // Define newPaginatedUrl
                if (newPage === currentPageUrl) {
                    hasNextPage = false;
                }
                currentPageUrl = newPage;
                i++;
            } else {
                hasNextPage = false;
            }
        }
    } catch (error) {
        console.error("Scraping failed:", error);
    } finally {
        await browser.close();
    }

    return results;
}
interface ProductDetails {
    [key: string]: string;
}

interface Ingredients {
    [key: string]: string;
}

interface NutritionalInformation {
    [key: string]: string;
}

interface ProductResults {
    basicDetails: ProductDetails;
    ingredients: Ingredients;
    nutritionTable: NutritionalInformation;
}

const keyTranslations: { [key: string]: string } = {
    "Kilmės šalis": "originCountry",
    "Prekės ženklas": "brand",
    Gamintojas: "manufacturer",
    "Grynasis kiekis": "netQuantity",
    "Sudedamosios dalys": "ingredientsList",
    "Laikymo sąlygos ir papildoma informacija": "storageConditions",
    "Maistinė informacija": "nutritionalInformation",
    "energinė vertė": "energyValue",
    riebalai: "fats",
    "iš kurių sočiųjų riebalų rūgščių": "saturatedFats",
    angliavandeniai: "carbohydrates",
    "iš kurių cukrų": "ofWhichSugars",
    baltymai: "proteins",
    druska: "salt",
};

const scrapeProduct = async (url: string): Promise<ProductResults> => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0" });

    const results = await page.evaluate((translations) => {
        const translateKey = (key: string) => translations[key] || key;

        const extractDetails = (selector: string) => {
            const items = document.querySelectorAll(selector);
            const details: { [key: string]: string } = {};
            items.forEach((item) => {
                const title = item.querySelector("span")?.textContent?.trim();
                const value = item.querySelector(".text p")?.textContent?.trim();
                if (title && value) details[translateKey(title)] = value;
            });
            return details;
        };

        const extractIngredients = (selector: string) => {
            const items = document.querySelectorAll(selector);
            const ingredients: { [key: string]: string } = {};
            items.forEach((item) => {
                const heading = item.closest(".product__list-wrapper")?.querySelector(".heading")?.textContent?.trim();
                const content = item.querySelector(".text p")?.textContent?.trim();
                if (heading && content) ingredients[translateKey(heading)] = content;
            });
            return ingredients;
        };

        const extractNutritionTable = (selector: string) => {
            const rows = document.querySelectorAll(selector);
            const nutrition: { [key: string]: string } = {};
            rows.forEach((row) => {
                const nutrient = row.children[0].textContent?.trim();
                const amount = row.children[1].textContent?.trim();
                if (nutrient && amount) nutrition[translateKey(nutrient)] = amount;
            });
            return nutrition;
        };

        const productDetails: ProductResults = {
            basicDetails: extractDetails(".product__list-wrapper.-basic .item"),
            ingredients: extractIngredients(".product__list-wrapper:not(.-basic) .item"),
            nutritionTable: extractNutritionTable(".product__table table tbody tr"),
        };

        return productDetails;
    }, keyTranslations);

    await browser.close();
    return results;
};


const path = "../outputRimiTest.json";

const processBatch = async (keys: string[], jsonData: any, batchSize: number): Promise<void> => {
    for (let i = 0; i < keys.length; i += batchSize) {
        const batchKeys = keys.slice(i, i + batchSize);
        await Promise.all(
            batchKeys.map(async (key) => {
                const product = jsonData[key];
                if (product.url) {
                    const additionalInfo = await scrapeProduct(product.url);
                    product.additionalInfo = additionalInfo;
                }
            })
        );

        // Save progress after each batch
        await writeFileAsync(path, JSON.stringify(jsonData, null, 2), "utf8");
        console.log(`Batch ${i / batchSize + 1} processed and saved.`);
    }
};

const updateFileWithData = async (filePath: string): Promise<void> => {
    try {
        const data = await readFileAsync(filePath, "utf8");
        let jsonData: ProductData = JSON.parse(data);
        const keys = Object.keys(jsonData);
        await processBatch(keys, jsonData, 10); // Process in batches of 10

        console.log("All data has been updated and saved.");
    } catch (err) {
        console.error("Error processing file:", err);
    }
};

const scrapeAll = async() => {
    const pathNames = [
        "https://www.rimi.lt/e-parduotuve/lt/produktai/vaisiai-darzoves-ir-geles/c/SH-15?currentPage=1&pageSize=80",
        "https://www.rimi.lt/e-parduotuve/lt/produktai/veganams-ir-vegetarams/c/SH-77?currentPage=1&pageSize=80",
        "https://www.rimi.lt/e-parduotuve/lt/produktai/pieno-produktai-kiausiniai-ir-suris/c/SH-11?currentPage=1&pageSize=80",
        "https://www.rimi.lt/e-parduotuve/lt/produktai/duonos-gaminiai-ir-konditerija/c/SH-3?currentPage=1&pageSize=800",
        "https://www.rimi.lt/e-parduotuve/lt/produktai/mesa-zuvys-ir-kulinarija/c/SH-9?currentPage=1&pageSize=80",
        "https://www.rimi.lt/e-parduotuve/lt/produktai/saldytas-maistas/c/SH-13?currentPage=1&pageSize=80",
        "https://www.rimi.lt/e-parduotuve/lt/produktai/bakaleja/c/SH-2?currentPage=1&pageSize=80",
        "https://www.rimi.lt/e-parduotuve/lt/produktai/saldumynai-ir-uzkandziai/c/SH-23?currentPage=1&pageSize=80",
        "https://www.rimi.lt/e-parduotuve/lt/produktai/vaiku-ir-kudikiu-prekes/c/SH-7?currentPage=1&pageSize=80",
        "https://www.rimi.lt/e-parduotuve/lt/produktai/gerimai/c/SH-4?currentPage=1&pageSize=80",
        "https://www.rimi.lt/e-parduotuve/lt/produktai/alkoholiniai-ir-nealkoholiniai-gerimai/c/SH-1?currentPage=1&pageSize=80",
        "https://www.rimi.lt/e-parduotuve/lt/produktai/kosmetika-ir-higiena/c/SH-6?currentPage=1&pageSize=80",
        "https://www.rimi.lt/e-parduotuve/lt/produktai/buitines-chemijos-ir-valymo-priemones/c/SH-16?currentPage=1&pageSize=80",
        "https://www.rimi.lt/e-parduotuve/lt/produktai/namu-ukio-gyvunu-ir-laisvalaikio-prekes/c/SH-10?currentPage=1&pageSize=80",
        "https://www.rimi.lt/e-parduotuve/lt/produktai/-vikis-prekiu-krautuvele/c/SH-18?currentPage=1&pageSize=80",
    ];
    for (let i = 0; i < pathNames.length; i++) {
        await scrapeList(pathNames[i])
        console.log("done", i)
    }
    console.log("viskas")
}


/*
updateFileWithData(
    path
)

*/

scrapeAll()
/*
//scrape list of products for initial data

*/
