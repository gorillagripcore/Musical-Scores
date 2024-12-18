// Import necessary modules from AWS SDK
const { S3Client, DeleteObjectsCommand, GetObjectCommand, ListObjectsV2Command, HeadObjectCommand, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const fs = require('fs');

// Initialize an S3 client with provided credentials
const s3Client = new S3Client({
    region: process.env.AWS_REGION, // Specify the AWS region from environment variables
    credentials: {
        accessKeyId: process.env.AWS_ACCESSKEYID, // Access key ID from environment variables
        secretAccessKey: process.env.AWS_SECRETACCESSKEY // Secret access key from environment variables
    }
});

// Export folder names for easier reference
exports.awsFolderNames = {
    scores: 'scores',
    programs: 'programs'
};

exports.uploadFileToAws = async (fileName, filePath) => {
    try {
      // Configure the parameters for the S3 upload
      const uploadParams = {
        Bucket: process.env.AWS.BUCKET_NAME,
        Key: fileName,
        Body: fs.createReadStream(filePath), 
      };
  
      // Upload the file to S3
        await s3Client.send(new PutObjectCommand(uploadParams)).then((data)=>{
        // Delete the file from the local filesystem after successful upload
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
            } else {
                console.log('File deleted successfully.');
            }
            });
        }
      });
  
    } catch (err) {
      console.error('Error ', err);
      return 'error';
    }
};