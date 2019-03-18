'use strict';

const authorizer = require('./authorizer');
var AWS = require('aws-sdk'),
	uuid = require('uuid'),
	documentClient = new AWS.DynamoDB.DocumentClient();

module.exports.insertMyData = (event,context,callback) => {
  const reqbody = JSON.parse(event.body);
  console.log('reqbody..',reqbody);
  function appendDataToArray (personId,data,myattribute) {
  return documentClient.update({
    TableName: 'mydata',
    Key: { userId: personId },
    ReturnValues: 'ALL_NEW',
    UpdateExpression: 'set #attridata = list_append(if_not_exists(#attridata, :empty_list), :data)',
    ExpressionAttributeNames: {
      '#attridata': myattribute
    },
    ExpressionAttributeValues: {
      ':data': [data],
      ':empty_list': []
    }
  }).promise()
}
console.log('data to insert..',reqbody.data);
appendDataToArray(reqbody.userId,reqbody.data,reqbody.attribute).then((updatedData) => {
  console.log('updated data....',updatedData);
  const response = {
    statusCode: 200,
    body: JSON.stringify({
    response:'3',
    message:'data inserted successfully'
    })
  };
  callback(null, response);
})
.catch((rejected) => {
  throw rejected;
})
}

module.exports.fetchMyData = (event, context, callback) => {
	 const requestBody = JSON.parse(event.body);
	 console.log('userid from req..',requestBody.userId);
   var tabParams = {
        TableName : 'mydata',
				KeyConditionExpression: "#user = :userid",
    		ExpressionAttributeNames:{
        "#user": "userId"
    		},
    		ExpressionAttributeValues: {
        ":userid": requestBody.userId
    		}
      };

       documentClient.query(tabParams, function(err, data){
        if(err){
            callback(err, null);
        }else{
					if(typeof data === null){
						const response = {
	            statusCode: 200,
							body: JSON.stringify({
							response:'0',
							message:'Invalid user',
	            userInfo: data.Items
							})
	          };
	          callback(null, response);
					}else{
          const response = {
            statusCode: 200,
						body: JSON.stringify({
						response:'3',
						message:'user fetched successfully',
            userInfo: data.Items
						})
          };
          callback(null, response);
        }
			}
      });
};
