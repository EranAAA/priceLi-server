const AWS = require('aws-sdk');
require('dotenv').config();
AWS.config.update({
    region: process.env.AWS_DEFAULT_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamoClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'rami-levi-price-full';

const getData = async () => {
    const params = {
        TableName: TABLE_NAME,
        "AttributesToGet": ["ItemCode"],
    };
    const data = await dynamoClient.scan(params).promise()
    console.log('getData', data.Items.length);
    return data.Items
};

// const getCharacterById = async (id) => {
//     const params = {
//         TableName: TABLE_NAME,
//         Key: {
//             id,
//         },
//     };
//     return await dynamoClient.get(params).promise();
// };

// const addOrUpdateCharacter = async (character) => {
//     const params = {
//         TableName: TABLE_NAME,
//         Item: character,
//     };
//     return await dynamoClient.put(params).promise();
// };

// const deleteCharacter = async (id) => {
//     const params = {
//         TableName: TABLE_NAME,
//         Key: {
//             id,
//         },
//     };
//     return await dynamoClient.delete(params).promise();
// };

const clearDynamoDB = async () => {
    const chunkSize = 25;
    let count = 0
    const data = await getData()
    for (let i = 0; i < data.length; i += chunkSize) {
        const items = data.slice(i, i + chunkSize);
        const putReqs = items.map(item => ({ DeleteRequest: { Key: { ItemCode: item.ItemCode } } }))
        const req = { RequestItems: { 'rami-levi-price-full': putReqs } }

        await dynamoClient.batchWrite(req).promise()
        console.log(i, ' Items Deleted');
        count++ 

    }
    console.log('Job done', count)
}

const saveToDynamoDB = async (data) => {
    const chunkSize = 25
    let count = 0
    for (let i = 0; i < data.length; i += chunkSize) {
        const items = data.slice(i, i + chunkSize);
        const putReqs = items.map(item => ({ PutRequest: { Item: item } }))
        const req = { RequestItems: { 'rami-levi-price-full': putReqs } }

        await dynamoClient.batchWrite(req).promise()
        console.log(i, ' Items Added');
        count++
    }
    console.log('Job done', count)
}

module.exports = {
    // dynamoClient,
    getData,
    // getCharacterById,
    // addOrUpdateCharacter,
    // deleteCharacter,
    clearDynamoDB,
    saveToDynamoDB
};

getData()
