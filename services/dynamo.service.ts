// const AWS = require("aws-sdk")
import * as AWS from "aws-sdk"
import { Prices } from "../interfaces/table"

require("dotenv").config()

// Load AWS credentials from environment variables
const credentials = {
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: process.env.AWS_DEFAULT_REGION,
}

// Update AWS configuration with new credentials
AWS.config.update(credentials)

const dynamoClient = new AWS.DynamoDB.DocumentClient()
const TABLE_NAME = "rami-levi-price-full"

const getData = async () => {
	const params = {
		TableName: TABLE_NAME,
		AttributesToGet: ["ItemCode"],
	}
	const data = await dynamoClient.scan(params).promise()
	// console.log("getData", data.Items.length)
	return data.Items
}

const clearDynamoDB = async () => {
	// const chunkSize = 25
	// let count = 0
	// const data = await getData()
	// for (let i = 0; i < data.length; i += chunkSize) {
	// 	const items = data.slice(i, i + chunkSize)
	// 	const putReqs = items.map((item: any) => ({ DeleteRequest: { Key: { ItemCode: item.ItemCode } } }))
	// 	const req = { RequestItems: { "rami-levi-price-full": putReqs } }
	// 	await dynamoClient.batchWrite(req).promise()
	// 	console.log(i, " Items Deleted")
	// 	count++
	// }
	// console.log("Job done", count)
}
 
const saveToDynamoDB = async (data: any) => {
	const chunkSize = 25
	let count = 0
	for (let i = 0; i < data.length; i += chunkSize) {
		const items = data.slice(i, i + chunkSize)
		const putReqs = items.map((item: any) => ({ PutRequest: { Item: item } }))
		const req = { RequestItems: { "rami-levi-price-full": putReqs } }

		await dynamoClient.batchWrite(req).promise()
		console.log(i, " Items Added")
		count++
	}
	console.log("Job done", count)
}

const uploadToS3 = async (data: Prices[], bucketName: string, fileName: string): Promise<void> => {
	// Set up AWS S3
	const s3 = new AWS.S3()

	// Convert the array of objects to JSON string
	const jsonData = JSON.stringify(data, null, 2)

	// Specify the parameters for uploading to S3
	const params: AWS.S3.PutObjectRequest = {
		Bucket: bucketName,
		Key: fileName,
		Body: jsonData,
		ContentType: "application/json",
	}

	// Upload to S3
	await s3.putObject(params).promise()

	console.log(`File uploaded to S3: ${fileName}`)
}

module.exports = {
	getData,
	clearDynamoDB,
	saveToDynamoDB,
	uploadToS3,
}

// getData()
