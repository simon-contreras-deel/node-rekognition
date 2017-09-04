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
    }

    doCall(endpoint, params) {
        return new Promise((resolve, reject) => {
            this.rekognition[endpoint](params, function (err, data) {
                if (err)
                    reject(err, err.stack)
                else
                    resolve(data)
            })
        })
    }

    detectLabels(bucket, imageFile) {
        const params = {
            Image: {
                S3Object: {
                    Bucket: bucket,
                    Name: imageFile
                }
            },
            MaxLabels: 123,
            MinConfidence: 35
        }

        return this.doCall('detectLabels', params)
    }

    detectFaces(bucket, imageFile) {
        const params = {
            Image: {
                S3Object: {
                    Bucket: bucket,
                    Name: imageFile
                }
            }
        }

        return this.doCall('detectFaces', params)
    }

    /**
     * Compares a face in the source input image with each face detected in the target input image
     * 
     * @param {string} bucket 
     * @param {string} sourceImageName 
     * @param {string} targetImageName 
     * @param {string} threshold The minimum level of confidence in the face matches
     */
    compareFaces(bucket, sourceImageName, targetImageName, threshold = 90) {
        let params = {
            SimilarityThreshold: threshold,
            SourceImage: {
                S3Object: {
                    Bucket: bucket, 
                    Name: sourceImageName
                }
            },
            TargetImage: {
                S3Object: {
                    Bucket: bucket,
                    Name: targetImageName
                }
            }
        }

        return this.doCall('compareFaces', params)
    }
}