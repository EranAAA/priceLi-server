const puppeteer = require("puppeteer")
const logger = require("./logger.service")

const fs = require("fs")
const path = require("path")

const URL_PATH = "https://url.retail.publishedprices.co.il/login"

const startScrapingProcess = async (storeId: string, userName: string, password: string) => {
	const browser = await puppeteer.launch({
		ignoreHTTPSErrors: true,
	})
	const page = await browser.newPage()

	const client = await page.target().createCDPSession()
	await client.send("Page.setDownloadBehavior", { behavior: "allow", downloadPath: "./files" })
	logger.info("Set Download Behavior")

	await page.goto(URL_PATH)
	logger.info("Enter page successefully")

	await page.type("#username", userName)
	logger.info("insert userName", userName)

	if (password) {
		await page.type("#password", password)
		logger.info("insert password", password)
	}

	await Promise.all([page.click("#login-button"), page.waitForNavigation({ waitUntil: "networkidle0" })])
	logger.info("Submitted form")

	logger.info("Searching...")
	await page.type(".form-control", storeId, { delay: 1000 })

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

	// if (storeId === "PriceFull7290058140886-029") await page.screenshot({ path: "screenshot/ramiLeviPrice.png", fullPage: true })
	// if (storeId === "PromoFull7290058140886-029") await page.screenshot({ path: "screenshot/ramiLeviPromo.png", fullPage: true })
	// logger.info("Screenshot created successfully")

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

module.exports = {
	startScrapingProcess,
}
