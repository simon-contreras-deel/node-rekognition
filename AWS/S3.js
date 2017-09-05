'use strict'

const AWS = require('aws-sdk')
const fs = require('fs')
const parameters = require('../parameters')
const debug = require('debug')('IAIRekognition:S3')

module.exports = class S3 {
    constructor(AWSParameters) {
        this.AWSParameters = AWSParameters
        this.s3 = new AWS.S3({
            accessKeyId: AWSParameters.accessKeyId,
            secretAccessKey: AWSParameters.secretAccessKey,
            region: AWSParameters.region,
            params: {
                Bucket: AWSParameters.bucket
            }
        })
    }

    async upload(filePath, folder) {
        const s3FilePath = this.getS3FullPath(filePath, folder)

        if (!await this.exists(s3FilePath)) {
            return new Promise((resolve, reject) => {

                const fileStream = fs.createReadStream(filePath)

                const params = {
                    Key: s3FilePath,
                    Body: fileStream
                }

                const opts = {
                    queueSize: 10, // upload parts in parallel
                    partSize: 1024 * 1024 * 10 //10Mb
                }

                this.s3.upload(params, opts)
                    .on('httpUploadProgress', function (evt) {
                        debug('upload-part', evt.loaded, '/', evt.total)
                    })
                    .send(function (err, data) {
                        if (err) {
                            debug('upload-error', err)
                            reject(err)
                        }

                        debug('upload-finish', s3FilePath)
                        resolve(data)
                    })
            })
        } else {
            debug('file-already-exists')
            return {
                Bucket: this.AWSParameters.bucket,
                Key: s3FilePath
            }
        }
    }

    /**
     * Upload multiple files to S3 in parallel
     * 
     * @param {array of strings} filePaths 
     * @param {string} folder 
     * @return {array} of S3 files in the same input order
     */
    async uploadMultiple(filePaths, folder) {
        return await Promise.all(
            filePaths.map(filePath => this.upload(filePath, folder))
        )
    }

    /**
     * Check if file exists in S3
     * 
     * @param {string} s3FilePath 
     * @return {boolean Promise} 
     */
    async exists(s3FilePath) {
        return new Promise((resolve, reject) => {
            this.s3.headObject({ Key: s3FilePath }, function (err, data) {
                if (!err)
                    resolve(true)

                resolve(false)
            })
        })
    }

    getS3FullPath(filePath, folder) {
        folder = folder || parameters.defaultFolder
        const fileName = new Date().getTime() + '-' + filePath.split('/').pop()

        return folder + fileName
    }
}

