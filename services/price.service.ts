const { gzip, ungzip } = require("node-gzip")
const util = require("util")

const scrapingService = require("./scraping.service")

const convert = require("xml-js")
let { gunzip } = require("zlib")
gunzip = util.promisify(gunzip)

const _getStringFromGzipFile = async (inputFilePath: string) => {
	const fs = require("fs")
	const sourceBuffer = await fs.promises.readFile(inputFilePath)
	return await gunzip(sourceBuffer)
}

const getPrices = async (storeId: string, type: string, userName: string, password: string) => {
	const logger = require("./logger.service")

	try {
		logger.info("Loading prices", storeId)

		const path = await scrapingService.startScrapingProcess(storeId, userName, password)
		logger.info("PATH: ", path)

		const stringContent = await _getStringFromGzipFile(`./files/${path.title}`)
		const compressed = await gzip(stringContent)
		const decompressed = await ungzip(compressed)
		const data = convert.xml2json(decompressed, { compact: true, spaces: 4 })

		let rows = JSON.parse(data)

		if (type === "promo") {
			rows = rows.Root.Promotions.Promotion
			rows = rows.map((promo: any) => {
				return {
					PromotionId: promo.PromotionId._text,
					PromotionDescription: promo.PromotionDescription._text,
					PromotionStartDate: promo.PromotionStartDate._text,
					PromotionEndDate: promo.PromotionEndDate._text,
					PromotionUpdateDate: promo.PromotionUpdateDate._text,
					PromotionMinQty: promo?.MinQty?._text || "",
					PromotionDiscountedPrice: promo?.DiscountedPrice?._text || "",
					PromotionDiscountRate: promo?.DiscountRate?._text || "",
					PromotionItemCode: promo.PromotionItems.Item instanceof Array ? promo.PromotionItems.Item.map((item: any) => item.ItemCode._text) : [promo.PromotionItems.Item.ItemCode._text],
					// PromotionDiscountedPricePerMida: promo?.DiscountedPricePerMida?._text || "",
					// PromotionMinNoOfItemOfered: promo?.MinNoOfItemOfered?._text || "",
					// PromotionWeightUnit: promo?.WeightUnit?._text || "",
				}
			})
			console.log("EXAMPLE_PROMO: ", rows[0])
			logger.info("Got Promos: ", rows.length)
		} else if (type === "price") {
			rows = rows.Root.Items.Item
			rows = rows.map((price: any) => {
				return {
					ItemCode: price.ItemCode._text,
					ItemId: price.ItemId._text,
					ItemName: price.ItemName._text,
					ItemPrice: price.ItemPrice._text,
					ManufacturerName: price.ManufacturerName._text,
					Quantity: price.Quantity._text,
					// AllowDiscount: price.AllowDiscount._text,
					// ItemStatus: price.ItemStatus._text,
					// ItemType: price.ItemType._text,
					// ManufactureCountry: price.ManufactureCountry._text,
					// ManufacturerItemDescription: price.ManufacturerItemDescription._text,
					// PriceUpdateDate: price.PriceUpdateDate._text,
					// QtyInPackage: price.QtyInPackage._text,
					// UnitOfMeasure: price.UnitOfMeasure._text,
					// UnitOfMeasurePrice: price.UnitOfMeasurePrice._text,
					// UnitQty: price.UnitQty._text,
					// bIsWeighted: price.bIsWeighted._text,
					promotions: [],
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
