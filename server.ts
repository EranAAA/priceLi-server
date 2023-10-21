import { Prices, Promotion } from "./interfaces/table"

// const CronJob = require("cron").CronJob
const priceService = require("./services/price.service")
const dynamoService = require("./services/dynamo.service")
const logger = require("./services/logger.service")
const stores = require("./files/stores.json")

// var job = new CronJob(
// 	"0 0 */6 * * *",
// 	// '*/30 * * * * *',
// 	async function () {
// 		const logger = require("./services/logger.service")
// 		logger.info("*************START*****************")
// 		logger.info("Starting job every 3 hours")
// 		await startScrpping()
// 		logger.info("*************END*****************")
// 	},
// 	null,
// 	true,
// 	"America/Los_Angeles"
// )
// job.start()

const startProcesses = async () => {
	const prices1 = await startProcessByStore("PriceFull7290058140886-029", "PromoFull7290058140886-029", "RamiLevi", "029-pardes-hanna.json", "rami-levi-prices-bucket", "")
	const prices2 = await startProcessByStore("PriceFull7291059100008-005", "PromoFull7291059100008-005", "politzer", "005-karkur.json", "politzer-prices-bucket", "")
	const prices3 = await startProcessByStore("PriceFull7291059100008-008", "PromoFull7291059100008-008", "politzer", "008-pardes-hanna.json", "politzer-prices-bucket", "")
	const prices4 = await startProcessByStore("PriceFull7290492000005-656", "PromoFull7290492000005-656", "doralon", "656-ein-shemer.json", "doralon-prices-bucket", "")
	const prices5 = await startProcessByStore("PriceFull7290644700005-312", "PromoFull7290644700005-312", "Paz_bo", "312-karkur.json", "yellow-prices-bucket", "paz468")

	const results = await buildCombinedTable(["רמי לוי - ביג פרדס חנה", "פוליצר כרכור", "פוליצר פרדס חנה", "סופר אלונית עין שמר", "ילו כרכור"], prices1, prices2, prices3, prices4, prices5)

	logger.info("Uploading ALL FILES TABLE to AWS")
	const valuesArray = Object.keys(results).map(key => {
		return { ItemCode: key, ...results[key] }
	})
	
	if (Object.keys(results).length) {
		await dynamoService.uploadToS3(valuesArray, "all-prices-bucket", "000-all-prices.json")
	}

	// Online NOTE: gz file can't extract the mnl file because is strcture
	// await startProcessByStore("PriceFull7290058140886-039", "PromoFull7290058140886-039", "RamiLevi", "039-internet.json", "rami-levi-prices-bucket", "")

	dynamoService.uploadToS3({ date: new Date() }, "info-prices-bucket", "date.json")
	dynamoService.uploadToS3(stores, "info-prices-bucket", "stores.json")
}

const startProcessByStore = async (priceStoreId: string, promoStoreId: string, userName: string, bucketFileName: string, bucketName: string, password: string) => {
	logger.info(`--------Start ${userName} process--------`)

	let pricesWithPromotion: Prices[] = []
	const prices: Prices[] = await priceService.getPrices(priceStoreId, "price", userName, password)
	const promos: Promotion[] = await priceService.getPrices(promoStoreId, "promo", userName, password)

	pricesWithPromotion = prices

	logger.info("Starting tables combine prices with promotion")

	for (let i = 0; i < prices.length; i++) {
		for (let j = 0; j < promos.length; j++) {
			const promo = promos[j]
			if ("PromotionItemCode" in promo && Array.isArray(promo?.PromotionItemCode)) {
				if (promo.PromotionItemCode.some((code: any) => code === prices[i].ItemCode)) {
					promo.PromotionAdditionalRestrictions === "1" && delete promo.PromotionItemCode
					pricesWithPromotion[i].promotions.push(promo)
				}
			}
		}
	}

	logger.info("Uploading to AWS")
	// if (pricesWithPromotion.length) {
	// 	await dynamoService.uploadToS3(pricesWithPromotion, bucketName, bucketFileName)
	// }

	logger.info(`--------Finish ${userName} process--------`)

	return pricesWithPromotion
}

type MergedResult = { [key: string]: { product: {}; prices: { store_name: string; ItemPrice: string; promotions: Promotion[] }[] } }

// Combine arrays based on the "ItemCode" key
const buildCombinedTable = async (names: string[], ...arrays: Prices[][]) => {
	const result: MergedResult = {}
	arrays.forEach((arr, idx) => {
		arr.forEach(obj => {
			const { ItemCode, ItemPrice, promotions, ...rest } = obj
			if (!result[ItemCode]) {
				result[ItemCode] = { product: { ...rest }, prices: [] }
			}
			result[ItemCode].prices.push({ store_name: names[idx], ItemPrice: ItemPrice, promotions: promotions })
		})
	})

	return result
}

startProcesses()
