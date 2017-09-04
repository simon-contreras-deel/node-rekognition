'use strict'

const expect = require('chai').expect
const S3 = require('../../AWS/S3')
const parameters = require('../../parameters')

const debug = require('debug')('IAIRekognition:test:S3')

const imagePath = __dirname + '/../../images/lake.jpg'
const s3 = new S3(parameters.AWS)

describe('S3', function () {
    it('not existing file should be ok', async function () {        
        const result = await s3.exists('not-existing-file')
        
        expect(result).to.be.false
    })

    it('upload file should be ok', async function () {
        const s3Image = await s3.upload(imagePath, parameters.defaultFolder)

        expect(s3Image).to.have.property('ETag')
        expect(s3Image).to.have.property('Location')
        expect(s3Image).to.have.property('Key')
        expect(s3Image).to.have.property('Bucket')
        expect(s3Image.Bucket).to.be.equal(parameters.AWS.bucket)
    })
})
