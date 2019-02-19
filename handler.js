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
  //callback(null, 'successfull');
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
