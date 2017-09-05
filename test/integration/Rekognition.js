'use strict'

const expect = require('chai').expect
const Rekognition = require('../../AWS/rekognition')
const S3 = require('../../AWS/S3')
const parameters = require('../../parameters')

const debug = require('debug')('IAIRekognition:test:Rekognition')

const rekognition = new Rekognition(parameters.AWS)
const s3 = new S3(parameters.AWS)

let imageFile, sourceImageFile, targetImageFile, billGatesFile, moderationFile

describe('IAIRekognition', function () {
    before( async function () {
        this.timeout(10000)

        const imagePaths = [
            __dirname + '/../../images/run.jpg',
            __dirname + '/../../images/Mark_Zuckerberg.jpg',
            __dirname + '/../../images/Mark_Zuckerberg_and_wife2.jpg',
            __dirname + '/../../images/Bill_Gates.jpg',
            __dirname + '/../../images/volley_beach.jpg'
        ]

        const s3Images = await s3.uploadMultiple(imagePaths, parameters.defaultFolder)
        imageFile = s3Images[0].Key
        sourceImageFile = s3Images[1].Key
        targetImageFile = s3Images[2].Key
        billGatesFile = s3Images[3].Key
        moderationFile = s3Images[4].Key
    })

    it('detect labels should response ok and have labels', async function () {
        this.timeout(10000)
        const imageLabels = await rekognition.detectLabels(parameters.AWS.bucket, imageFile)

        expect(imageLabels).to.have.property('Labels')
        expect(imageLabels.Labels).to.be.an('array')
        imageLabels.Labels.forEach(function (element) {
            expect(element).to.have.property('Name')
            expect(element).to.have.property('Confidence')
        })
    })

    it('detect faces should response ok and have details', async function () {
        this.timeout(10000)
        const imageFaces = await rekognition.detectFaces(parameters.AWS.bucket, imageFile)

        expect(imageFaces).to.have.property('FaceDetails')
        expect(imageFaces.FaceDetails).to.be.an('array')
        imageFaces.FaceDetails.forEach(function (element) {
            expect(element).to.have.property('BoundingBox')
            expect(element).to.have.property('Landmarks')
            expect(element).to.have.property('Pose')
            expect(element).to.have.property('Quality')
            expect(element).to.have.property('Confidence')
        })
    })

    it('compare faces of Mark_Zuckerberg and Mark_Zuckerberg_and_wife2 should match and unmatch', async function () {
        this.timeout(10000)
        const faceMatches = await rekognition.compareFaces(parameters.AWS.bucket, sourceImageFile, targetImageFile)

        expect(faceMatches).to.have.property('FaceMatches')
        expect(faceMatches).to.have.property('UnmatchedFaces')
        expect(faceMatches.FaceMatches).to.be.an('array')
        expect(faceMatches.UnmatchedFaces).to.be.an('array')
        expect(faceMatches.FaceMatches.length).to.be.equal(1)
        expect(faceMatches.UnmatchedFaces.length).to.be.equal(1)
        faceMatches.FaceMatches.forEach(function (element) {
            expect(element).to.have.property('Similarity')
            expect(element).to.have.property('Face')
        })
    })

    it('compare faces of Mark_Zuckerberg and Bill_Gates should unmatch', async function () {
        this.timeout(10000)
        const faceMatches = await rekognition.compareFaces(parameters.AWS.bucket, sourceImageFile, billGatesFile)

        expect(faceMatches).to.have.property('FaceMatches')
        expect(faceMatches).to.have.property('UnmatchedFaces')
        expect(faceMatches.FaceMatches).to.be.an('array')
        expect(faceMatches.UnmatchedFaces).to.be.an('array')
        expect(faceMatches.FaceMatches.length).to.be.equal(0)
        expect(faceMatches.UnmatchedFaces.length).to.be.equal(1)
        faceMatches.FaceMatches.forEach(function (element) {
            expect(element).to.have.property('Similarity')
            expect(element).to.have.property('Face')
        })
    })

    it('detect moderation labels should response ok and have details', async function () {
        this.timeout(10000)
        const moderationLabels = await rekognition.detectModerationLabels(parameters.AWS.bucket, moderationFile)

        expect(moderationLabels).to.have.property('ModerationLabels')
        expect(moderationLabels.ModerationLabels).to.be.an('array')
        moderationLabels.ModerationLabels.forEach(function (element) {
            expect(element).to.have.property('Name')
            expect(element).to.have.property('Confidence')
            expect(element).to.have.property('ParentName')
        })
    })
})
