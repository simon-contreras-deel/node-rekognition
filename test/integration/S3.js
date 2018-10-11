'use strict'

const expect = require('chai').expect
const S3 = require('../../AWS/S3')
const parameters = require('../../parameters')

const debug = require('debug')('node-rekognition:test:S3')

const imagePath = __dirname + '/../../images/run.jpg'
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

    it('upload multiple files should be ok and ordered', async function () {
        this.timeout(10000)

        const fileNames = [
            'run.jpg',
            'Mark_Zuckerberg.jpg',
            'Mark_Zuckerberg_and_wife2.jpg',
            'Bill_Gates.jpg',
            'volley_beach.jpg'
        ]

        const imagePaths = fileNames.map( fileName => __dirname + '/../../images/' + fileName)

        const s3Images = await s3.uploadMultiple(imagePaths, parameters.defaultFolder)

        // s3Image.Key = parameters.defaultFolder + new Date().getTime() + '-' + fileName
        const indexOfFileName = parameters.defaultFolder.length + (new Date().getTime() + '-').length

        expect(s3Images).to.be.an('array')
        s3Images.forEach( (s3Image, index) => {
            expect(s3Image).to.have.property('ETag')
            expect(s3Image).to.have.property('Location')
            expect(s3Image).to.have.property('Key')
            expect(s3Image).to.have.property('Bucket')
            expect(s3Image.Bucket).to.be.equal(parameters.AWS.bucket)
            expect(s3Image.Key.indexOf(fileNames[index])).to.be.equal(indexOfFileName)
        })
    })
})
