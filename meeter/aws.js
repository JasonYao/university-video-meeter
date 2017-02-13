// Required AWS settings
var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var fs = require('fs');                             // Used in reading local file once uploaded
var secrets = require('./secrets');                 // Reads in secret keys

AWS.config.update({
    region: secrets.region,
    accessKeyId: secrets.accessKeyId,
    secretAccessKey: secrets.secretAccessKey
});

// This function should return the URL of the uploaded image
function uploadToS3(file, callback) {
    var s3Object = {};
    var fileName = file.filename;

    // Since the multer middleware saves the file locally, we need to read it and then erase it after.
    fs.readFile(file.path, function (err, data) {
        if (err) {
            s3Object.errors = err;
            return s3Object;
        }
        else {
            var params = {
                Bucket: secrets.bucket,
                Key: fileName,
                Body: data,
                ContentType: file.mimetype, // Sets it so that it can display the file correctly instead of just downloading
                ACL: 'public-read' // Sets it so the file is publicly available
            };

            s3.upload(params, function(err, data) {
                // Removes the temp file regardless of whether the upload succeeds or not
                fs.unlink(file.path, function (unlinkErr) {
                    if (unlinkErr) {
                        s3Object.errors = unlinkErr;
                        callback(s3Object);
                    }
                    else {
                        if (err) {
                            // There was an error uploading to S3
                            s3Object.errors = err;
                            callback(s3Object);
                        }
                        else {
                            // File successfully uploaded to S3
                            s3Object.link = data.Location;
                            callback(s3Object);
                        }
                    }
                });
            });
        }
    });
} // End of the uploadToS3 function

// Place this inside routers using uploadToS3 function:

/*
var multer  = require('multer');                    // Used for multi-part file uploading
var upload = multer({ dest: 'img/uploads/' });      // Used for multi-part file uploading
var aws = require('../aws');

 router.post('/test', upload.single('file'), function (req, res, next) {
 var context = {};

 aws.uploadToS3(req.file, function (response) {
 console.log("response: ", response);

 if (response.errors) {
 context.title = "test failed";
 res.render('test', context);
 }
 else {
 context.link = response.link;
 context.title = "test success";
 res.render("test", context);
 }
 });
 });*/





/**
 * Functions that are enabled to be exported for use in other files
 */
module.exports = {
    uploadToS3: uploadToS3
};