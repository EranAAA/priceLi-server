var CronJob = require("cron").CronJob

const priceService = require("./services/price.service")
const dynamoService = require("./services/dynamo.service")

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
	console.log("Start")

	const prices = await priceService.getPrices("PriceFull7290058140886-029", "rami-levi-price-full")
	const promos = await priceService.getPrices("PromoFull7290058140886-029", "rami-levi-promo-full")

	for (let i = 0; i < prices.length; i++) {
		for (let j = 0; j < promos.length; j++) {
			if (promos[j].ItemCode.some(code => code === prices[i].ItemCode)) prices[i].promotion = promos[j]
		}

		// if (i === 50) console.log(i);
		// else if (i === 100) console.log(i);
		// else if (i === 250) console.log(i);
		// else if (i === 1000) console.log(i);
		// else if (i === 2000) console.log(i);
		// else if (i === 5000) console.log(i);
		// else if (i === 7000) console.log(i);
		// else if (i === 9000) console.log(i);
	}

	// console.log(prices.slice(0, 50));
	// console.log(prices.length);

	// AWS
	// if (prices.length) {
	// 	await dynamoService.clearDynamoDB()
	// 	await dynamoService.saveToDynamoDB(prices)
	// }
}

startScrpping()
