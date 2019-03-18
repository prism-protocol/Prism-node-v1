'use strict';

const authorizer = require('./authorizer');
var AWS = require('aws-sdk'),
	uuid = require('uuid'),
	documentClient = new AWS.DynamoDB.DocumentClient();
var s3 = new AWS.S3();

module.exports.uploadFile = (event, context, callback) => {
 const requestBody = JSON.parse(event.body);
 //console.log('body params..',requestBody);
// Grabs your file object from the request.
//const fileEncodeData = event.body.profilepic;
		// Begins the upload to the AWS S3
		console.log('name of the sender...',requestBody.name);
		const userId = uuid.v1();
		const type = 'png';
		//console.log('fileEncodeData...',requestBody.profilepic);
		var  base64Data = new Buffer(requestBody.profilepic.replace(/^data:image\/\w+;base64,/, ""),'base64');
    var params = {
			Bucket: 'prismusers',
 			Key: `${userId}.${type}`, // type is not required
 			Body: base64Data,
 			ACL: 'public-read',
 			ContentEncoding: 'base64', // required
 			ContentType: `image/${type}` // required. Notice the back ticks
   };
   s3.putObject(params, function(err, data){
      if(err) {
					console.log('eror found...',err);
          callback(err, null);
      } else {
				const imageURI ="https://s3.cn-north-1.amazonaws.com.cn/prismusers/"+`${userId}.${type}`;
        const response = {
          statusCode: 200,
          body: JSON.stringify({
						"message":"Image uploaded successfully",
            "imageUrl": imageURI
          })
        };
      callback(null, response);
   }
 });
};
