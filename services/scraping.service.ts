const puppeteer = require("puppeteer")
const logger = require("./logger.service")

const fs = require("fs")
const path = require("path")

const USER_NAME = "RamiLevi"
const URL_PATH = "https://url.retail.publishedprices.co.il/login"

// const _getRamiLeviFile = async path => {
// 	const filePath = `./files/${path.title}`
// 	const URL = path.href + path.title

// 	// console.log('File Path: ', filePath)
// 	// console.log('Full URL: ', 'https://url.retail.publishedprices.co.il' + path.href)

// 	try {
// 		const file = fs.createWriteStream(filePath)
// 		// const request = https.get(URL, (response) => {
// 		//    response.pipe(file)
// 		// })

// 		// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
// 		console.log(URL)
// 		request
// 			.get(URL)
// 			.on("error", err => {
// 				console.error("******** error: ********", err)
// 			})
// 			.pipe(file)

// 		console.log("File SAVED")
// 	} catch (error) {
// 		console.log("******** ERROR: ********", error)
// 	}
// }

// const _renameFile = () => {
// 	const folderPath = "./files"

// 	let filesArr = fs.readdirSync(folderPath)
// 	filesArr.forEach(file => {
// 		let fullPath = path.join(folderPath, file)
// 		let fileExtension = path.extname(file)
// 		let fileName = path.basename(file, fileExtension)

// 		if (fileExtension === ".crdownload") {
// 			console.log(file)
// 			console.log(path.extname(file))
// 			let newFileName = fileName
// 			try {
// 				fs.renameSync(fullPath, path.join(folderPath, newFileName))
// 			} catch (error) {
// 				console.error(error)
// 			}
// 		}
// 	})
// }

// const _delay = (time: number) => {
// 	return new Promise(function (resolve) {
// 		setTimeout(resolve, time)
// 	})
// }

const getRamiLeviPuppeteer = async (fileName: string) => {
	const browser = await puppeteer.launch({
		ignoreHTTPSErrors: true,
	})
	const page = await browser.newPage()

	const client = await page.target().createCDPSession()
	await client.send("Page.setDownloadBehavior", { behavior: "allow", downloadPath: "./files" })
	logger.info("Set Download Behavior")

	await page.goto(URL_PATH)
	logger.info("Enter Rami Levi page successefully")

	await page.type("#username", USER_NAME)
	logger.info("insert UserName: ", USER_NAME)

	await Promise.all([page.click("#login-button"), page.waitForNavigation({ waitUntil: "networkidle0" })])
	logger.info("Submitted form")

	logger.info("Searching...")
	await page.type(".form-control", fileName, { delay: 1000 })

	const data = await page.evaluate(() => {
		return Promise.resolve({
			href: (document as any).querySelector("tbody").lastChild.querySelector("a").getAttribute("href"),
			title: (document as any).querySelector("tbody").lastChild.querySelector("a").getAttribute("title"),
		})
	})

	logger.info("Create object with the last children")
	logger.info(data)

	await page.click(`a[title="${data.title}"]`)
	await waitUntilDownload(page)

	if (fileName === "PriceFull7290058140886-029") await page.screenshot({ path: "screenshot/ramiLeviPrice.png", fullPage: true })
	if (fileName === "PromoFull7290058140886-029") await page.screenshot({ path: "screenshot/ramiLeviPromo.png", fullPage: true })
	logger.info("Screenshot created successfully")

	await browser.close()

	return data
}

const waitUntilDownload = async (page: any, fileName = "") => {
	return new Promise((resolve, reject) => {
		page._client().on("Page.downloadProgress", (e: any) => {
			if (e.state === "completed") {
				logger.info("Successfully downloaded")
				logger.info(e)
				resolve(fileName)
			} else if (e.state === "canceled") {
				reject()
			}
		})
	})
}

// Implement
const getRamiLevi = async (fileName: string) => {
	logger.info("====================================")
	logger.info("Start RamiLevi process")
	logger.info("====================================")
	return await getRamiLeviPuppeteer(fileName)
}

module.exports = {
	getRamiLevi,
}
