'use strict'

const AWS = require('aws-sdk')
const debug = require('debug')('node-rekognition:Rekognition')
const S3 = require('./S3')

module.exports = class Rekognition {
    constructor(AWSParameters) {
        this.rekognition = new AWS.Rekognition({
            accessKeyId: AWSParameters.accessKeyId,
            secretAccessKey: AWSParameters.secretAccessKey,
            region: AWSParameters.region
        })

        this.s3 = new S3(AWSParameters)
        this.bucket = AWSParameters.bucket
    }

    /**
     * Upload image or images array to S3 bucket into specified folder
     *
     * @param {Array.<string>|string} imagePaths
     * @param {string} folder a folder name inside your AWS S3 bucket (it will be created if not exists)
     */
    async uploadToS3(imagePaths, folder) {
        if (Array.isArray(imagePaths))
            return await this.s3.uploadMultiple(imagePaths, folder)
        else
            return await this.s3.upload(imagePaths, folder)
    }

    /**
     * Do the request to AWS Rekognition
     *
     * @param {string} endpoint
     * @param {Object} params
     */
    doCall(endpoint, params) {
        return new Promise((resolve, reject) => {
            this.rekognition[endpoint](params, function (err, data) {
                if (err) {
                    reject(err)
                }
                else
                    resolve(data)
            })
        })
    }

    /**
     * Utility to get image params for s3 object or Bytes
     *
     * @param {Object|Buffer} image
     * @return {Object} image params for Rekognition
     */

    getImageParams(image) {
        return image instanceof Buffer
            ? {
                Bytes: image
            }
            : {
                S3Object: {
                    Bucket: this.bucket,
                    Name: image.Key
                }
            };
    }

    /**
     * Detects instances of real-world labels within an image
     *
     * @param {Object|Buffer} image
     * @param {string} threshold
    */
    async detectLabels(image, threshold = 50) {
        const params = {
            Image: this.getImageParams(image),
            MaxLabels: 4096,
            MinConfidence: threshold
        }

        return await this.doCall('detectLabels', params)
    }

    /**
     * Detects faces within an image
     *
     * @param {Object|Buffer} image
     */
    async detectFaces(image) {
        const params = {
            Image: this.getImageParams(image)
        }

        return await this.doCall('detectFaces', params)
    }

    /**
     * Compares a face in the source input image with each face detected in the target input image
     *
     * @param {Object|Buffer} sourceImage
     * @param {Object|Buffer} targetImage
     * @param {string} threshold
     */
    async compareFaces(sourceImage, targetImage, threshold = 90) {
        const params = {
            SimilarityThreshold: threshold,
            SourceImage: this.getImageParams(sourceImage),
            TargetImage: this.getImageParams(targetImage)
        }

        return await this.doCall('compareFaces', params)
    }

    /**
     * Detects explicit or suggestive adult content in image
     *
     * @param {Object|Buffer} image
     * @param {number} threshold
     */
    async detectModerationLabels(image, threshold = 50) {
        const params = {
            Image: this.getImageParams(image),
            MinConfidence: threshold
        }

        return await this.doCall('detectModerationLabels', params)
    }

    /**
     * Creates a collection
     *
     * @param {string} collectionId
     */
    async createCollection(collectionId) {
        const params = {
            CollectionId: collectionId
        }

        return await this.doCall('createCollection', params)
    }

    /**
     * Deletes a collection
     *
     * @param {string} collectionId
     */
    async deleteCollection(collectionId) {
        const params = {
            CollectionId: collectionId
        }

        return await this.doCall('deleteCollection', params)
    }

    /**
     * Detects faces in the input image and adds them to the specified collection
     *
     * @param {string} collectionId
     * @param {Object|Buffer} image
     */
    async indexFaces(collectionId, image) {
        var params = {
            CollectionId: collectionId,
            Image: this.getImageParams(image)
        }

        return await this.doCall('indexFaces', params)
    }

    /**
     * List the metadata for faces indexed in the specified collection
     *
     * @param {string} collectionId
     */
    async listFaces(collectionId) {
        var params = {
            CollectionId: collectionId,
            MaxResults: 4096
        }

        return await this.doCall('listFaces', params)
    }

    /**
     * Searches in the collection for matching faces of faceId
     *
     * @param {string} collectionId
     * @param {string} faceId
     * @param {number} threshold
     */
    async searchFacesByFaceId(collectionId, faceId, threshold = 90) {
        var params = {
            CollectionId: collectionId,
            FaceId: faceId,
            FaceMatchThreshold: threshold,
            MaxFaces: 4096
        }

        return await this.doCall('searchFaces', params)
    }

    /**
     * First detects the largest face in the image (indexes it), and then searches the specified collection for matching faces.
     *
     * @param {string} collectionId
     * @param {Object} s3Image
     * @param {number} threshold
     */
    async searchFacesByImage(collectionId, image, threshold = 90) {
        var params = {
            CollectionId: collectionId,
            Image: this.getImageParams(image),
            FaceMatchThreshold: threshold,
            MaxFaces: 4096
        }

        return await this.doCall('searchFacesByImage', params)
    }
}
