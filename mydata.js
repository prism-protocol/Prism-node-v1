'use strict';

const authorizer = require('./authorizer');
var AWS = require('aws-sdk'),
	uuid = require('uuid'),
	documentClient = new AWS.DynamoDB.DocumentClient();

module.exports.insertMyData = (event,context,callback) => {
  const reqbody = JSON.parse(event.body);
  console.log('reqbody..',reqbody);
	var upExpression;
  function appendDataToArray (personId,data,myattribute) {
  return documentClient.update({
    TableName: 'mydata',
    Key: { userId: personId },
    ReturnValues: 'UPDATED_NEW',
		//UpdateExpression: 'set #attridata1 = if_not_exists(#attridata1, :empty_list), #attridata = list_append((#attridata, :data)',
    UpdateExpression: upExpression,
    ExpressionAttributeNames: {
      '#attridata1': "BMI",
			'#attridata2': "PSA",
			'#attridata3': "weight",
			'#attridata4': "bloodPressure",
			'#attridata5': "cholesterol"
    },
    ExpressionAttributeValues: {
      ':data': [data],
      ':empty_list': []
    }
  }).promise()
}

console.log('data to insert..',reqbody.data);
if(reqbody.attribute === "BMI"){
	console.log('bmi calling..');
	upExpression = 'set #attridata1 = list_append(if_not_exists(#attridata1, :empty_list), :data), #attridata2  = if_not_exists(#attridata2, :empty_list), #attridata3 = if_not_exists(#attridata3, :empty_list), #attridata4 = if_not_exists(#attridata4, :empty_list), #attridata5 = if_not_exists(#attridata5, :empty_list)';
}else if(reqbody.attribute === "PSA"){
	console.log('PSA calling..');
	upExpression = 'set #attridata2 = list_append(if_not_exists(#attridata2, :empty_list), :data), #attridata1  = if_not_exists(#attridata1, :empty_list), #attridata3 = if_not_exists(#attridata3, :empty_list), #attridata4 = if_not_exists(#attridata4, :empty_list), #attridata5 = if_not_exists(#attridata5, :empty_list)';

}else if(reqbody.attribute === "weight"){
	console.log('weight calling..');
	upExpression = 'set #attridata3 = list_append(if_not_exists(#attridata3, :empty_list), :data), #attridata2  = if_not_exists(#attridata2, :empty_list), #attridata1 = if_not_exists(#attridata1, :empty_list), #attridata4 = if_not_exists(#attridata4, :empty_list), #attridata5 = if_not_exists(#attridata5, :empty_list)';

}else if(reqbody.attribute === "bloodPressure"){
	upExpression = 'set #attridata4 = list_append(if_not_exists(#attridata4, :empty_list), :data), #attridata2  = if_not_exists(#attridata2, :empty_list), #attridata3 = if_not_exists(#attridata3, :empty_list), #attridata1 = if_not_exists(#attridata1, :empty_list), #attridata5 = if_not_exists(#attridata5, :empty_list)';
	console.log('bloodPressure calling..');
}else if(reqbody.attribute === "cholesterol"){
	upExpression = 'set #attridata5 = list_append(if_not_exists(#attridata5, :empty_list), :data), #attridata2  = if_not_exists(#attridata2, :empty_list), #attridata3 = if_not_exists(#attridata3, :empty_list), #attridata4 = if_not_exists(#attridata4, :empty_list), #attridata1 = if_not_exists(#attridata1, :empty_list)';
	console.log('cholesterol calling..');
}else{
	console.log('pass correct attributes');
}

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
	callback(null, rejected);
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
