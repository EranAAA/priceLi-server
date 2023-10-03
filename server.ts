import { Prices } from "./interfaces/table"

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
	// const prices = await priceService.getPrices("PriceFull7290058140886-029", "rami-levi-price-full")
	// const promos = await priceService.getPrices("PromoFull7290058140886-029", "rami-levi-promo-full")

	// for (let i = 0; i < prices.length; i++) {
	// 	for (let j = 0; j < promos.length; j++) {
	// 		if (promos[j].ItemCode.some((code: any) => code === prices[i].ItemCode)) prices[i].promotion = promos[j]
	// 	}
	// }

	// console.log(prices.slice(0, 50))
	// console.log(prices.length)

	// AWS
	// if (prices.length) {
	// 	await dynamoService.clearDynamoDB()
	// 	await dynamoService.saveToDynamoDB(prices)
	// }

	// Example usage

	const myData: Prices[] = [
		{
			ItemCode: "7290102392049",
			AllowDiscount: "1",
			ItemId: "1012733",
			ItemName: "גבינה לאפיה תבור ללא",
			ItemPrice: "24.70",
			ItemStatus: "1",
			ItemType: "1",
			ManufactureCountry: "לא ידוע",
			ManufacturerItemDescription: "גבינה לאפיה תבור ללא",
			ManufacturerName: "משק צוריאל",
			PriceUpdateDate: "2023-08-07 12:03:43",
			QtyInPackage: "לא ידוע",
			Quantity: "500.00",
			UnitOfMeasure: "100 גרם",
			UnitOfMeasurePrice: "0.0494",
			UnitQty: "גרמים",
			bIsWeighted: "0",
			PromotionId: "1309578",
			PromotionDescription: "גבינת תבור 22.60",
			PromotionUpdateDate: "2023-08-13 00:00",
			PromotionStartDate: "2023-08-13",
			PromotionMinQty: "1.00",
			PromotionDiscountedPrice: "22.60",
			PromotionDiscountedPricePerMida: "22.60",
			PromotionMinNoOfItemOfered: "10",
			PromotionWeightUnit: "1",
			PromotionDiscountRate: null,
			PromotionItemCode: [],
		},
		{
			ItemCode: "1110110553623",
			AllowDiscount: "1",
			ItemId: "6562699",
			ItemName: "ציטוס קראנצ צ'דר חלפ",
			ItemPrice: "4.20",
			ItemStatus: "1",
			ItemType: "1",
			ManufactureCountry: "לא ידוע",
			ManufacturerItemDescription: "ציטוס קראנצ צ'דר חלפ",
			ManufacturerName: "לא ידוע",
			PriceUpdateDate: "2023-04-12 20:20:05",
			QtyInPackage: "לא ידוע",
			Quantity: "80.00",
			UnitOfMeasure: "100 גרם",
			UnitOfMeasurePrice: "0.0525",
			UnitQty: "גרמים",
			bIsWeighted: "0",
		},
	]

	const myBucketName = "full-prices-bucket"
	const myFileName = "full-prices-rami_levi-ph.json"

	// Call the function
	dynamoService.uploadToS3(myData, myBucketName, myFileName)
}

startScrpping()
