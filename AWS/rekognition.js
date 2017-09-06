'use strict'

const AWS = require('aws-sdk')
const debug = require('debug')('IAIRekognition:Rekognition')


module.exports = class Rekognition {
    constructor(AWSParameters) {
        this.rekognition = new AWS.Rekognition({
            accessKeyId: AWSParameters.accessKeyId,
            secretAccessKey: AWSParameters.secretAccessKey,
            region: AWSParameters.region
        })

        this.bucket = AWSParameters.bucket
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
     * Detects instances of real-world labels within an image 
     * 
     * @param {string} s3ImageKey 
     */
    async detectLabels(s3ImageKey) {
        const params = {
            Image: {
                S3Object: {
                    Bucket: this.bucket,
                    Name: s3ImageKey
                }
            },
            MaxLabels: 123,
            MinConfidence: 35
        }

        return await this.doCall('detectLabels', params)
    }

    /**
     * Detects faces within an image
     * 
     * @param {string} s3ImageKey 
     */
    async detectFaces(s3ImageKey) {
        const params = {
            Image: {
                S3Object: {
                    Bucket: this.bucket,
                    Name: s3ImageKey
                }
            }
        }

        return await this.doCall('detectFaces', params)
    }

    /**
     * Compares a face in the source input image with each face detected in the target input image
     * 
     * @param {string} sourceS3ImageKey 
     * @param {string} targetS3ImageKey 
     * @param {string} threshold The minimum level of confidence in the face matches
     */
    async compareFaces(sourceS3ImageKey, targetS3ImageKey, threshold = 90) {
        const params = {
            SimilarityThreshold: threshold,
            SourceImage: {
                S3Object: {
                    Bucket: this.bucket, 
                    Name: sourceS3ImageKey
                }
            },
            TargetImage: {
                S3Object: {
                    Bucket: this.bucket,
                    Name: targetS3ImageKey
                }
            }
        }

        return await this.doCall('compareFaces', params)
    }

    /**
     * Detects explicit or suggestive adult content in image
     * 
     * @param {string} s3ImageKey 
     * @param {number} threshold 
     */
    async detectModerationLabels(s3ImageKey, threshold = 0) {
        const params = {
            Image: {
                S3Object: {
                    Bucket: this.bucket,
                    Name: s3ImageKey
                }
            },
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
     * Detects faces in the input image and adds them to the specified collection
     * 
     * @param {string} collectionId 
     * @param {string} s3ImageKey 
     */
    async indexFaces(collectionId, s3ImageKey) {
        var params = {
            CollectionId: collectionId,
            Image: {
                S3Object: {
                    Bucket: this.bucket, 
                    Name: s3ImageKey
                }
            }
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
     * @param {string} s3ImageKey 
     * @param {number} threshold
     */
    async searchFacesByImage(collectionId, s3ImageKey, threshold = 90) {
        var params = {
            CollectionId: collectionId,
            Image: {
                S3Object: {
                    Bucket: this.bucket, 
                    Name: s3ImageKey
                }
            },
            FaceMatchThreshold: threshold,
            MaxFaces: 4096
        }
        
        return await this.doCall('searchFacesByImage', params)
    }
}