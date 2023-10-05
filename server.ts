import { Prices, Promotion } from "./interfaces/table"

const CronJob = require("cron").CronJob
const priceService = require("./services/price.service")
const dynamoService = require("./services/dynamo.service")

const BUCKET_NAME = "full-prices-bucket"
const FILE_NAME = "full-prices-rami_levi-ph.json"
const TABLE_NAME = "rami-levi-price-full"

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

const startScrpping = async () => {
	let pricesWithPromotion: Prices[] = []
	const prices: Prices[] = await priceService.getPrices("PriceFull7290058140886-029", "rami-levi-price-full")
	const promos: Promotion[] = await priceService.getPrices("PromoFull7290058140886-029", "rami-levi-promo-full")

	pricesWithPromotion = prices

	for (let i = 0; i < prices.length; i++) {
		for (let j = 0; j < promos.length; j++) {
			const promo = promos[j]
			if ("PromotionItemCode" in promo && Array.isArray(promo?.PromotionItemCode)) {
				if (promo.PromotionItemCode.some((code: any) => code === prices[i].ItemCode)) {
					delete promo.PromotionItemCode
					pricesWithPromotion[i].promotions.push(promo)
				}
			}
		}
	}

	// AWS
	if (pricesWithPromotion.length) {
		await dynamoService.uploadToS3(/*pricesDemo*/ pricesWithPromotion /*.slice(0,1000) ONLY THE FIRST 1000 FOR NOW */, BUCKET_NAME, FILE_NAME)
	}
}

startScrpping()
