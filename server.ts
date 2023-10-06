import { Prices, Promotion } from "./interfaces/table"

// const CronJob = require("cron").CronJob
const priceService = require("./services/price.service")
const dynamoService = require("./services/dynamo.service")
const logger = require("./services/logger.service")

const BUCKET_NAME = "full-prices-bucket"

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
	logger.info("--------Start RamiLevi process--------")
	await startProcessByStore("PriceFull7290058140886-029", "PromoFull7290058140886-029", "RamiLevi", "full-prices-rami_levi-ph.json")
	logger.info("--------Finish RamiLevi process--------")
}

const startProcessByStore = async (priceStoreId: string, promoStoreId: string, userName: string, bucketFileName: string) => {
	let pricesWithPromotion: Prices[] = []
	const prices: Prices[] = await priceService.getPrices(priceStoreId, "price", userName)
	const promos: Promotion[] = await priceService.getPrices(promoStoreId, "promo", userName)

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
		await dynamoService.uploadToS3(pricesWithPromotion /*.slice(0,1000) ONLY THE FIRST 1000 FOR NOW */, BUCKET_NAME, bucketFileName)
	}
}

startProcesses()

// const DEMO = [
// 	{
// 		ItemCode: "3073781190595",
// 		ItemId: "6681102",
// 		ItemName: "גבינה לואשקירי 240גר",
// 		ItemPrice: "26.70",
// 		ManufacturerName: "לא ידוע",
// 		Quantity: "240.00",
// 		promotions: [
// 			{
// 				PromotionId: "1307023",
// 				PromotionDescription: "גבינת לוואש קירי 16יח ב19.90",
// 				PromotionStartDate: "2023-08-13",
// 				PromotionEndDate: "2023-10-07",
// 				PromotionUpdateDate: "2023-07-12 00:00",
// 				PromotionMinQty: "1.00",
// 				PromotionDiscountedPrice: "19.90",
// 				PromotionDiscountRate: "",
// 			},
// 		],
// 	},
// 	{
// 		ItemCode: "7296168330070",
// 		ItemId: "6528199",
// 		ItemName: "כוס אימון 340 + קשית",
// 		ItemPrice: "18.90",
// 		ManufacturerName: "לא ידוע",
// 		Quantity: "1.00",
// 		promotions: [],
// 	},
// 	{
// 		ItemCode: "7290002019183",
// 		ItemId: "5061013",
// 		ItemName: "פריניר עגב שלמות במי",
// 		ItemPrice: "6.80",
// 		ManufacturerName: "נטו מלינדה",
// 		Quantity: "465.00",
// 		promotions: [],
// 	},
// 	{
// 		ItemCode: "7290000139104",
// 		ItemId: "1011018",
// 		ItemName: "שלווה חיטה תפוחה מתו",
// 		ItemPrice: "7.90",
// 		ManufacturerName: "אשבול",
// 		Quantity: "230.00",
// 		promotions: [
// 			{
// 				PromotionId: "1310784",
// 				PromotionDescription: "שלווה 140-230גר 2ב14.90",
// 				PromotionStartDate: "2023-08-23",
// 				PromotionEndDate: "2023-10-07",
// 				PromotionUpdateDate: "2023-08-23 00:00",
// 				PromotionMinQty: "2.00",
// 				PromotionDiscountedPrice: "14.90",
// 				PromotionDiscountRate: "",
// 			},
// 		],
// 	},
// 	{
// 		ItemCode: "7290000139111",
// 		ItemId: "1011019",
// 		ItemName: "שלווה חיטה תפוחה מתו",
// 		ItemPrice: "3.40",
// 		ManufacturerName: "אשבול",
// 		Quantity: "90.00",
// 		promotions: [],
// 	},
// 	{
// 		ItemCode: "7290000139128",
// 		ItemId: "1011020",
// 		ItemName: "שלווה חטיף דגן תפוח",
// 		ItemPrice: "3.40",
// 		ManufacturerName: "אשבול",
// 		Quantity: "60.00",
// 		promotions: [],
// 	},
// 	{
// 		ItemCode: "7290000139180",
// 		ItemId: "1011021",
// 		ItemName: "שלווה חיטה מלאה תפוח",
// 		ItemPrice: "8.70",
// 		ManufacturerName: "אשבול",
// 		Quantity: "140.00",
// 		promotions: [],
// 	},
// 	{
// 		ItemCode: "7290000139227",
// 		ItemId: "1011024",
// 		ItemName: "אשבול דגן לבן 150גר",
// 		ItemPrice: "7.90",
// 		ManufacturerName: "אשבול",
// 		Quantity: "150.00",
// 		promotions: [],
// 	},
// 	{
// 		ItemCode: "7290000139234",
// 		ItemId: "1011025",
// 		ItemName: "אשבול דגן חמאה 150 ג",
// 		ItemPrice: "8.70",
// 		ManufacturerName: "אשבול",
// 		Quantity: "150.00",
// 		promotions: [],
// 	},
// 	{
// 		ItemCode: "7290000139258",
// 		ItemId: "1011026",
// 		ItemName: "שלווה דבש וסוכר חום",
// 		ItemPrice: "8.70",
// 		ManufacturerName: "אשבול",
// 		Quantity: "250.00",
// 		promotions: [],
// 	},
// 	{
// 		ItemCode: "7290000185590",
// 		ItemId: "6462639",
// 		ItemName: "סילאן טבעי בבקבוק לח",
// 		ItemPrice: "19.90",
// 		ManufacturerName: "לא ידוע",
// 		Quantity: "635.00",
// 		promotions: [
// 			{
// 				PromotionId: "1308311",
// 				PromotionDescription: "סילאן לחיץ 635גר ב16.90",
// 				PromotionStartDate: "2023-08-13",
// 				PromotionEndDate: "2023-10-07",
// 				PromotionUpdateDate: "2023-08-13 00:00",
// 				PromotionMinQty: "1.00",
// 				PromotionDiscountedPrice: "16.90",
// 				PromotionDiscountRate: "",
// 			},
// 		],
// 	},
// 	{
// 		ItemCode: "7290002198031",
// 		ItemId: "6452661",
// 		ItemName: "פסטרמה פרגיות ללחמני",
// 		ItemPrice: "72.00",
// 		ManufacturerName: "לא ידוע",
// 		Quantity: "1.00",
// 		promotions: [
// 			{
// 				PromotionId: "1295623",
// 				PromotionDescription: "קנה 300 ג פסטרמות זוגלובק ב18 שח",
// 				PromotionStartDate: "2023-03-16",
// 				PromotionEndDate: "2023-12-31",
// 				PromotionUpdateDate: "2023-04-18 00:00",
// 				PromotionMinQty: "0.30",
// 				PromotionDiscountedPrice: "60.00",
// 				PromotionDiscountRate: "",
// 			},
// 		],
// 	},
// 	{
// 		ItemCode: "7290004064464",
// 		ItemId: "6609169",
// 		ItemName: 'מלח גס בשקית 1 ק"ג ר',
// 		ItemPrice: "1.50",
// 		ManufacturerName: "לא ידוע",
// 		Quantity: "1.00",
// 		promotions: [],
// 	},
// 	{
// 		ItemCode: "7290018566404",
// 		ItemId: "6593785",
// 		ItemName: "פסטה ספגטיני",
// 		ItemPrice: "3.40",
// 		ManufacturerName: "לא ידוע",
// 		Quantity: "1.00",
// 		promotions: [
// 			{
// 				PromotionId: "1300031",
// 				PromotionDescription: "פסטה רמילוי 2.50 מו4",
// 				PromotionStartDate: "2023-04-30",
// 				PromotionEndDate: "2023-10-07",
// 				PromotionUpdateDate: "2023-09-03 00:00",
// 				PromotionMinQty: "1.00",
// 				PromotionDiscountedPrice: "2.50",
// 				PromotionDiscountRate: "",
// 			},
// 		],
// 	},
// 	{
// 		ItemCode: "7290110553623",
// 		ItemId: "6562699",
// 		ItemName: "ציטוס קראנצ צ'דר חלפ",
// 		ItemPrice: "4.20",
// 		ManufacturerName: "לא ידוע",
// 		Quantity: "80.00",
// 		promotions: [
// 			{
// 				PromotionId: "1272080",
// 				PromotionDescription: "קופון 20שח הנחה מוצרי שטראוס",
// 				PromotionStartDate: "2022-05-03",
// 				PromotionEndDate: "2024-05-31",
// 				PromotionUpdateDate: "2023-02-13 00:00",
// 				PromotionMinQty: "",
// 				PromotionDiscountedPrice: "",
// 				PromotionDiscountRate: "2000",
// 			},
// 			{
// 				PromotionId: "1272082",
// 				PromotionDescription: "קופון 30שח הנחה מוצרי שטראוס",
// 				PromotionStartDate: "2022-05-03",
// 				PromotionEndDate: "2024-05-31",
// 				PromotionUpdateDate: "2023-02-13 00:00",
// 				PromotionMinQty: "",
// 				PromotionDiscountedPrice: "",
// 				PromotionDiscountRate: "3000",
// 			},
// 			{
// 				PromotionId: "1272083",
// 				PromotionDescription: "קופון 50שח הנחה מוצרי שטראוס",
// 				PromotionStartDate: "2022-05-03",
// 				PromotionEndDate: "2024-05-31",
// 				PromotionUpdateDate: "2023-02-13 00:00",
// 				PromotionMinQty: "",
// 				PromotionDiscountedPrice: "",
// 				PromotionDiscountRate: "5000",
// 			},
// 		],
// 	},
// 	{
// 		ItemCode: "7290018566022",
// 		ItemId: "6550153",
// 		ItemName: "שקד טבעי 280 גר בקופ",
// 		ItemPrice: "19.90",
// 		ManufacturerName: "לא ידוע",
// 		Quantity: "280.00",
// 		promotions: [],
// 	},
// 	{
// 		ItemCode: "7290000139609",
// 		ItemId: "1011040",
// 		ItemName: "אשבול פצפוצי אורז 37",
// 		ItemPrice: "10.90",
// 		ManufacturerName: "לא ידוע",
// 		Quantity: "375.00",
// 		promotions: [
// 			{
// 				PromotionId: "1310785",
// 				PromotionDescription: "פיצפוצי אורז 375גר ב9.90",
// 				PromotionStartDate: "2023-08-23",
// 				PromotionEndDate: "2023-10-07",
// 				PromotionUpdateDate: "2023-08-23 00:00",
// 				PromotionMinQty: "1.00",
// 				PromotionDiscountedPrice: "9.90",
// 				PromotionDiscountRate: "",
// 			},
// 		],
// 	},
// ]
