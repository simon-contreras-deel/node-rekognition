'use strict'

const S3 = require('./AWS/S3')
const Rekognition = require('./AWS/rekognition')


module.exports = class IAIRekognition {
    constructor(params) {
        this.params = params

        this.s3 = new S3(params)
        this.rekognition = new Rekognition(params)
    }

    async detectLabels(imagePath, folder) {
        let s3Image = await this.s3.upload(imagePath, folder)
        if (s3Image) {
            return await this.rekognition.detectLabels(s3Image.Bucket, s3Image.Key)
        }
    }

    async detectFaces(imagePath, folder) {
        let s3Image = await this.s3.upload(imagePath, folder)
        if (s3Image) {
            return await this.rekognition.detectFaces(s3Image.Bucket, s3Image.Key)
        }
    }

    /**
     * Compares a face in the source input image with each face detected in the target input image
     * 
     * @param {string} sourceImagePath 
     * @param {string} targetImagePath 
     * @param {string} folder 
     * @param {number} threshold The minimum level of confidence in the face matches
     */
    async compareFaces(sourceImagePath, targetImagePath, folder, threshold) {
        let s3SourceImage = await this.s3.upload(sourceImagePath, folder)
        let s3TargetImage = await this.s3.upload(targetImagePath, folder)
        if (s3SourceImage && s3TargetImage) {
            return await this.rekognition.compareFaces(
                s3SourceImage.Bucket, 
                s3SourceImage.Key,
                s3TargetImage.Key,
                threshold
            )
        }
    }

    async detectModerationLabels(imagePath, folder, threshold) {
        let s3Image = await this.s3.upload(imagePath, folder)
        if (s3Image) {
            return await this.rekognition.detectModerationLabels(s3Image.Bucket, s3Image.Key, threshold)
        }
    }
}