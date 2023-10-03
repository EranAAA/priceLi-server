import * as AWS from "aws-sdk"
import { Prices, PricesWithPromotion } from "../interfaces/table"

require("dotenv").config()

// Load AWS credentials from environment variables
const credentials = {
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: process.env.AWS_DEFAULT_REGION,
}

// Update AWS configuration with new credentials
AWS.config.update(credentials)

const uploadToS3 = async (data: PricesWithPromotion[], bucketName: string, fileName: string): Promise<void> => {
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
	uploadToS3,
}
