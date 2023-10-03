const { gzip, ungzip } = require("node-gzip")
const util = require("util")

const scrapingService = require("./scraping.service")

const convert = require("xml-js")
let { gunzip } = require("zlib")
gunzip = util.promisify(gunzip)

//
const _getStringFromGzipFile = async (inputFilePath: string) => {
	const fs = require("fs")
	const sourceBuffer = await fs.promises.readFile(inputFilePath)
	return await gunzip(sourceBuffer)
}

const getPrices = async (fileName: string, db: string) => {
	const logger = require("./logger.service")

	try {
		logger.info("Loading prices", fileName)

		const path = await scrapingService.getRamiLevi(fileName)
		logger.info("PATH: ", path)

		const stringContent = await _getStringFromGzipFile(`./files/${path.title}`)
		const compressed = await gzip(stringContent)
		const decompressed = await ungzip(compressed)
		const data = convert.xml2json(decompressed, { compact: true, spaces: 4 })

		let rows = JSON.parse(data)

		if (db === "rami-levi-promo-full") {
			rows = rows.Root.Promotions.Promotion
			rows = rows.map((promo: any) => {
				if (promo.PromotionItems.Item instanceof Array) {
					if (promo.PromotionItems.Item.length > 20) return { ...promo, ItemCode: [] }
					else
						return {
							// ...promo,
							PromotionId: promo.PromotionId._text,
							PromotionDescription: promo.PromotionDescription._text,
							PromotionEndDate: promo.PromotionEndDate._text,
							PromotionStartDate: promo.PromotionStartDate._text,
							MinQty: promo?.MinQty?._text || null,
							DiscountedPrice: promo?.DiscountedPrice?._text || null,
							DiscountedPricePerMida: promo?.DiscountedPricePerMida?._text || null,
							MinNoOfItemOfered: promo?.MinNoOfItemOfered?._text || null,
							WeightUnit: promo?.WeightUnit?._text || null,
							DiscountRate: promo?.DiscountRate?._text || null,
							ItemCode: promo.PromotionItems.Item.map((item: any) => item.ItemCode._text),
						}
				} else {
					return {
						// ...promo,
						PromotionId: promo.PromotionId._text,
						PromotionDescription: promo.PromotionDescription._text,
						PromotionUpdateDate: promo.PromotionUpdateDate._text,
						PromotionStartDate: promo.PromotionStartDate._text,
						MinQty: promo?.MinQty?._text || null,
						DiscountedPrice: promo?.DiscountedPrice?._text || null,
						DiscountedPricePerMida: promo?.DiscountedPricePerMida?._text || null,
						MinNoOfItemOfered: promo?.MinNoOfItemOfered?._text || null,
						WeightUnit: promo?.WeightUnit?._text || null,
						DiscountRate: promo?.DiscountRate?._text || null,
						ItemCode: [promo.PromotionItems.Item.ItemCode._text],
					}
				}
			})
			console.log("EXAMPLE_PROMO: ", rows[0])
			logger.info("Got Promos: ", rows.length)
		} else if (db === "rami-levi-price-full") {
			rows = rows.Root.Items.Item
			rows = rows.map((price: any) => {
				return {
					// ...price,
					ItemCode: price.ItemCode._text,
					AllowDiscount: price.AllowDiscount._text,
					ItemId: price.ItemId._text,
					ItemName: price.ItemName._text,
					ItemPrice: price.ItemPrice._text,
					ItemStatus: price.ItemStatus._text,
					ItemType: price.ItemType._text,
					ManufactureCountry: price.ManufactureCountry._text,
					ManufacturerItemDescription: price.ManufacturerItemDescription._text,
					ManufacturerName: price.ManufacturerName._text,
					PriceUpdateDate: price.PriceUpdateDate._text,
					QtyInPackage: price.QtyInPackage._text,
					Quantity: price.Quantity._text,
					UnitOfMeasure: price.UnitOfMeasure._text,
					UnitOfMeasurePrice: price.UnitOfMeasurePrice._text,
					UnitQty: price.UnitQty._text,
					bIsWeighted: price.bIsWeighted._text,
				}
			})
			console.log("EXAMPLE_PRICE: ", rows[0])
			logger.info("Got Prices: ", rows.length)
		}

		return rows
	} catch (error) {
		logger.error(error)
	}
}

module.exports = {
	getPrices,
}
