var Redshift = require('node-redshift');
var AWS = require('aws-sdk'),
	documentClient = new AWS.DynamoDB.DocumentClient();
  // For dev purposes only
AWS.config.update({region: 'us-east-1', accessKeyId: 'AKIAIYYLSTYS3NEX5DVA', secretAccessKey: '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'});
var cron = require('node-cron');
var s3 = new AWS.S3();

module.exports.cronJob = (event, context, callback) => {
  console.log('you will call function');
  console.log('running a task every two minutes');
  var clientConfiguration = {
    user: "vedas",   //prism
    database: "vedas", //prod
    password: "Vedascloud123",   //Prism1234
    port: 5439,
    host: "redshift-test.coopfclz8ydf.us-east-1.redshift.amazonaws.com", // prism.cfd3tzleujjb.cn-north-1.redshift.amazonaws.com.cn
  };

  var  redshiftClient = new Redshift(clientConfiguration, {rawConnection: true});
  var copyCmd = "copy users from 'dynamodb://Users' access_key_id 'AKIAOBLHYI3OO53YTFWQ' secret_access_key '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' region 'cn-north-1' readratio 50";

  redshiftClient.connect(function(err){
  if(err) throw err;
  else{
    redshiftClient.query("DELETE from users", function(error,deleted) {
      if(error) throw err;
      else{
        console.log('deleted successfully');
        redshiftClient.query(copyCmd, function(err, data){
          if(err) throw err;
          else{
            return console.log("redhshift load: no errors, seem to be successful!");
            redshiftClient.close();
            callback(null, 'ETL Job is done');
          }
        });
      }
    });
  }
});
};

module.exports.etlHealthData = (event, context, callback) => {
  console.log('you will call function');
  console.log('running a task every two minutes');
  var tabParams = {
       TableName : 'mydata'
     };
     documentClient.scan(tabParams, function(err, data){
       if(err){
           callback(err, null);
       }else{
         const type = 'json';
         const fname = 'mydata';

         var params = {
     			  Bucket: 'redshiftimportdata/orders',
      			Key: `${fname}.${type}`, // type is not required
      			Body: JSON.stringify(data.Items),
      			ContentEncoding: 'application/json', // required
      			ContentType: `application/${type}` // required. Notice the back ticks
        };
        s3.putObject(params, function(err, data){
           if(err) {
     					console.log('eror found...',err);
               callback(err, null);
           } else {
            // https://s3.amazonaws.com/redshiftimportdata/orders/mydata.json
     				const imageURI ="https://s3.amazonaws.com/redshiftimportdata/orders/"+`${fname}.${type}`;
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
       }
     });

/*  var clientConfiguration = {
    user: "vedas",
    database: "vedas",
    password: "Vedascloud123",
    port: 5439,
    host: "redshift-test.coopfclz8ydf.us-east-1.redshift.amazonaws.com",
  };

  var  redshiftClient = new Redshift(clientConfiguration, {rawConnection: true});
  //var copyCmd = "copy users from 'dynamodb://Users' access_key_id 'AKIAOBLHYI3OO53YTFWQ' secret_access_key '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' region 'cn-north-1' readratio 50";
  var copyCmd = "copy mydata from 'dynamodb://mydata' iam_role 'arn:aws:iam::095201015534:role/RedshiftCopyUnload' region 'us-east-1' readratio 50";
  redshiftClient.connect(function(err){
  if(err) throw err;
  else{
        console.log("connected successfully");
        console.log('deleted successfully');
        redshiftClient.query(copyCmd, function(err, data){
          if(err) {
            console.log('error found...',err);
            callback(err,null);
          }
          else{
            console.log("redhshift load: no errors, seem to be successful!");
            redshiftClient.close();
            callback(null, 'ETL Job is done');
          }
        });
      }
}); */
};

module.exports.devicesETL = (event, context, callback) => {
  console.log('you will call function');
  console.log('running a task everyday in the moring 10:15');
  var clientConfiguration = {
    user: "vedas",   //prism
    database: "vedas", //prod
    password: "Vedascloud123",   //Prism1234
    port: 5439,
    host: "redshift-test.coopfclz8ydf.us-east-1.redshift.amazonaws.com", // prism.cfd3tzleujjb.cn-north-1.redshift.amazonaws.com.cn
  };

  var  redshiftClient = new Redshift(clientConfiguration, {rawConnection: true});
  var copyCmd = "copy devices from 'dynamodb://Devices' access_key_id 'AKIAOBLHYI3OO53YTFWQ' secret_access_key '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' region 'cn-north-1' readratio 50";

  redshiftClient.connect(function(err){
  if(err) throw err;
  else{
    redshiftClient.query("DELETE from devices", function(error,deleted) {
      if(error) throw err;
      else{
        console.log('deleted successfully');
        redshiftClient.query(copyCmd, function(err, data){
          if(err) throw err;
          else{
            return console.log("redhshift load: no errors, seem to be successful!");
            redshiftClient.close();
            callback(null, 'ETL Job is done');
          }
        });
      }
    });
  }
});
};
