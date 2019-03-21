var Redshift = require('node-redshift');

var cron = require('node-cron');


module.exports.cronJob = (event, context, callback) => {
  console.log('you will call function');
  console.log('running a task every two minutes');
  var clientConfiguration = {
    user: "prism",
    database: "prod",
    password: "Prism1234",
    port: 5439,
    host: "prism.cfd3tzleujjb.cn-north-1.redshift.amazonaws.com.cn",
  };

  var  redshiftClient = new Redshift(clientConfiguration, {rawConnection: true});
  var copyCmd = "copy users from 'dynamodb://Users' access_key_id 'AKIAOBLHYI3OO53YTFWQ' secret_access_key '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' readratio 50";

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
          }
        });
      }
    });
  }
});

  /*// execute query and invoke callback...
  redshiftClient.query(copyCmd, function(err, result) {
        if(err) {
          return console.log('error running query', err);
        }
        return console.log("redhshift load: no errors, seem to be successful!");
        //redshiftClient.
      });

  return console.log('function invoked successful');*/

}
