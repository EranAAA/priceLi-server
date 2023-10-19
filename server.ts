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
	await startProcessByStore("PriceFull7290058140886-029", "PromoFull7290058140886-029", "RamiLevi", "029-pardes-hanna.json", "rami-levi-prices-bucket", "")
	await startProcessByStore("PriceFull7291059100008-005", "PromoFull7291059100008-005", "politzer", "005-karkur.json", "politzer-prices-bucket", "")
	await startProcessByStore("PriceFull7291059100008-008", "PromoFull7291059100008-008", "politzer", "008-pardes-hanna.json", "politzer-prices-bucket", "")
	await startProcessByStore("PriceFull7290492000005-656", "PromoFull7290492000005-656", "doralon", "656-ein-shemer.json", "doralon-prices-bucket", "")
	await startProcessByStore("PriceFull7290644700005-312", "PromoFull7290644700005-312", "Paz_bo", "312-karkur.json", "yellow-prices-bucket", "paz468")

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

	// AWS
	if (pricesWithPromotion.length) {
		await dynamoService.uploadToS3(pricesWithPromotion, bucketName, bucketFileName)
	}

	logger.info(`--------Finish ${userName} process--------`)
}

startProcesses()
