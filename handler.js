'use strict';

const authorizer = require('./authorizer');
var AWS = require('aws-sdk'),
	uuid = require('uuid'),
	documentClient = new AWS.DynamoDB.DocumentClient();

module.exports.hello = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'The token was valid and everything is fine!'
    })
  };
  callback(null, response);
};

module.exports.fetchEvents = (event, context, callback) => {
  const token = authorizer.generateToken(event);
  //console.log(token);
   var params = {
        TableName : 'Event'
      };
      documentClient.scan(params, function(err, data){
        if(err){
            callback(err, null);
        }else{
          const response = {
            statusCode: 200,
						body: JSON.stringify({
            jsonToken: token,
            eventsData: data.Items
						})
          };
          callback(null, response);
        }
      });
};

module.exports.fetchUser = (event, context, callback) => {
	 const requestBody = JSON.parse(event.body);
	 console.log('userid from req..',requestBody.userId);
   var tabParams = {
        TableName : 'Users',
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
					console.log('my data info..',data.Items);
					console.log('my data info..',data.Items.length);
					if(typeof data.Items === null || data.Items.length == 0 ){
						const response = {
	            statusCode: 200,
							body: JSON.stringify({
							response:'0',
							message:'Invalid user',
	            userInfo: data.Items,
							dataInfo: []
							})
	          };
	          callback(null, response);
					}else{
						var tableParams = {
				        TableName : 'mydata',
				 				KeyConditionExpression: "#user = :userid",
				     		ExpressionAttributeNames:{
				         "#user": "userId"
				     		},
				     		ExpressionAttributeValues: {
				         ":userid": requestBody.userId
				     		}
				       };

							 documentClient.query(tableParams, function(err, myData){
				        if(err){
				            callback(err, null);
				        }else{
									const response = {
				            statusCode: 200,
										body: JSON.stringify({
										response:'3',
										message:'user data fetched successfully',
				            userInfo: data.Items,
										dataInfo: myData.Items
										})
				          };
				          callback(null, response);
								}
							});
        }
			}
      });
};

module.exports.authorize = (event, context, callback) => {
  try {
    console.log(event.authorizationToken);
    console.log(event.methodArn);

    const policy = authorizer.generatePolicy(event.authorizationToken, event.methodArn);
    callback(null, policy);
  } catch (error) {
    console.log(error.message);
    callback(error.message);
  }
};
