'use strict'

const S3 = require('./AWS/S3')
const Rekognition = require('./AWS/rekognition')


module.exports = class IAIRekognition {
    constructor(params) {
        this.params = params

        this.s3 = new S3(params)
        this.rekognition = new Rekognition(params)
    }

    /**
     * Upload image or images array to S3 bucket into specified folder
     * 
     * @param {Array.<string>|string} imagePaths 
     * @param {string} folder 
     */
    async uploadToS3(imagePaths, folder) {
        if (Array.isArray(imagePaths))
            return await this.s3.uploadMultiple(imagePaths, folder)
        else
            return await this.s3.upload(imagePaths, folder)
    }

    /**
     * Detects instances of real-world labels within an image 
     * 
     * @param {Object} s3Image 
     */
    async detectLabels(s3Image) {
        return await this.rekognition.detectLabels(s3Image.Bucket, s3Image.Key)
    }

    /**
     * Detects faces within an image
     * 
     * @param {Object} s3Image 
     */
    async detectFaces(s3Image) {
        return await this.rekognition.detectFaces(s3Image.Bucket, s3Image.Key)
    }

    /**
     * Compares a face in the source input image with each face detected in the target input image
     * 
     * @param {Object} sourceS3Image 
     * @param {Object} targetS3Image 
     * @param {number} threshold The minimum level of confidence in the face matches
     */
    async compareFaces(sourceS3Image, targetS3Image, threshold) {
        return await this.rekognition.compareFaces(
            s3SourceImage.Bucket,
            s3SourceImage.Key,
            s3TargetImage.Key,
            threshold
        )
    }

    /**
     * Detects explicit or suggestive adult content in image
     * 
     * @param {Object} s3Image 
     * @param {number} threshold 
     */
    async detectModerationLabels(s3Image, threshold) {
        return await this.rekognition.detectModerationLabels(s3Image.Bucket, s3Image.Key, threshold)
    }
}