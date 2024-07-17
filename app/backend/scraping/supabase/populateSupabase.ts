import fs from 'fs';
import path from 'path';
import { PrismaClient, Product, Price } from '@prisma/client';

const prisma = new PrismaClient();

const dir: string = 'normalized'; //path of the normalized files folder
const errLog: string = 'error_log.txt';
const writeStream = fs.createWriteStream(errLog, { flags: 'a' });

interface NormalizedProduct {
  id: string;
  name: string;
  categoryId: string;
  price: number | null;
  url: string | null;
  image: string | null;
  pricePer: number | null;
  unit: string | null;
  shop: string;
  available: boolean;
}

async function insertRow(data: NormalizedProduct[]): Promise<void> {
  try {
    const productsToCreate: any[] = [];
    const pricesToCreate: any[] = [];
    const productMap = new Map<string, string>();

    console.log(`Processing batch of ${data.length} items`);

    for (const item of data) {
      let existingProduct: Product | null;
      try {
        existingProduct = await prisma.product.findUnique({
          where: {
            shopName_productShopId: {
              shopName: item.shop,
              productShopId: item.id,
            },
          },
        });
      } catch (err) {
        console.log('Error in finding existing product', err);
        writeStream.write(`Error finding unique product: ${err}`);
        throw err;
      }

      if (existingProduct) {
        productMap.set(`${item.id}_${item.shop}`, existingProduct.id);
      } else {
        let quantity: number | null = null;
        if (item.price !== null && item.pricePer !== null)
          quantity = item.price / item.pricePer;

        const newProduct = {
          productShopId: item.id,
          name: item.name,
          quantity: quantity,
          unit: item.unit,
          shopName: item.shop,
          url: item.url,
          image: item.image,
          available: item.available,
          categoryId: item.categoryId,
        };
        productsToCreate.push(newProduct);
      }
    }

    let createdProducts: Product[] = [];
    if (productsToCreate.length > 0) {
      try {
        createdProducts = await prisma.product.createManyAndReturn({
          data: productsToCreate,
          skipDuplicates: true,
        });

        for (const createdProduct of createdProducts) {
          productMap.set(
            `${createdProduct.productShopId}_${createdProduct.shopName}`,
            createdProduct.id,
          );
        }
      } catch (err) {
        writeStream.write('Failed to create many products: ' + err);
      }
    }

    for (const item of data) {
      const productId = productMap.get(`${item.id}_${item.shop}`);
      if (productId) {
        const newPrice = {
          productId: productId,
          price: item.price,
          pricePer: item.pricePer,
          discountPercent: null,
          discountStart: null,
          discountEnd: null,
          date: new Date(),
        };
        pricesToCreate.push(newPrice);
      }
    }

    let createdPrices: Price[] = [];
    if (pricesToCreate.length > 0) {
      try {
        createdPrices = await prisma.price.createManyAndReturn({
          data: pricesToCreate,
          skipDuplicates: true,
        });
      } catch (err) {
        writeStream.write('Failed to create many prices: ' + err);
      }

      try {
        if (createdPrices) {
          for (const price of createdPrices) {
            if (price.productId) {
              await prisma.product.update({
                where: {
                  id: price.productId,
                },
                data: {
                  priceId: price.id,
                },
                include: {
                  priceHistory: true,
                },
              });
            }
          }
        }
      } catch (error) {
        writeStream.write('Error updating product:' + error);
        throw error;
      }
    }

    console.log('Inserted batch');
  } catch (err) {
    writeStream.write('Whole error: ' + err);
  }
}

async function getObjFromJson() {
  const BATCH_SIZE = 100;

  fs.readdir(dir, (err, files) => {
    if (err) {
      return writeStream.write('Error reading directory' + err);
    }

    const normalizedFiles = files.filter((file) =>
      file.startsWith('normalized'),
    );
    let allData: NormalizedProduct[] = [];

    const filePromises = normalizedFiles.map((filePath) => {
      const fullPath = path.join(dir, filePath);

      return new Promise<void>((resolve, reject) => {
        fs.readFile(fullPath, 'utf8', async (err, json) => {
          if (err) {
            writeStream.write('Error reading file' + err);
            return reject(err);
          }

          try {
            const data: Record<string, any> = JSON.parse(json);

            for (const key of Object.keys(data)) {
              allData.push(data[key]);
              if (allData.length >= BATCH_SIZE) {
                console.log(`Batch size reached: ${BATCH_SIZE}`);

                await insertRow(allData.slice(0, BATCH_SIZE)).catch((err) => {
                  writeStream.write('error getting into function:' + err);
                });
                allData = [];
              }
            }
            if (allData.length > 0) {
              console.log(`Remaining items to process: ${allData.length}`);

              await insertRow(allData).catch((err) => {
                writeStream.write('error getting into function:' + err);
              });
            }
            resolve();
          } catch (err) {
            writeStream.write('Error parsing JSON' + err);
            reject(err);
          }
        });
      });
    });

    Promise.all(filePromises)
      .then(() => {
        console.log('All files processed successfully.');
        writeStream.close();
      })
      .catch((err) => {
        console.error('Error processing files' + err);
      });
  });
}

getObjFromJson();

async function clearAll() {
  await prisma.price.deleteMany();
  await prisma.product.deleteMany();
}

// clearAll();
