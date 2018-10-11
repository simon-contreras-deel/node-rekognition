'use strict'

const expect = require('chai').expect
const Rekognition = require('../../AWS/rekognition')
const parameters = require('../../parameters')
const fs = require('fs');

const debug = require('debug')('node-rekognition:test:Rekognition')

const rekognition = new Rekognition(parameters.AWS)

let imageFile, sourceImageFile, targetImageFile, billGatesFile, moderationFile, imageBuffer, sourceImageBuffer, targetImageBuffer, billGatesBuffer, moderationBuffer
const collectionId = new Date().getTime() + 'test'

describe('Rekognition', function () {
    this.timeout(10000)

    it('uploadToS3 should response ok', async function () {
        const imagePaths = [
            __dirname + '/../../images/run.jpg',
            __dirname + '/../../images/Mark_Zuckerberg.jpg',
            __dirname + '/../../images/Mark_Zuckerberg_and_wife2.jpg',
            __dirname + '/../../images/Bill_Gates.jpg',
            __dirname + '/../../images/volley_beach.jpg'
        ]

        const s3Images = await rekognition.uploadToS3(imagePaths, parameters.defaultFolder)
        imageFile = s3Images[0]
        sourceImageFile = s3Images[1]
        targetImageFile = s3Images[2]
        billGatesFile = s3Images[3]
        moderationFile = s3Images[4]

        imageBuffer = fs.readFileSync(imagePaths[0])
        sourceImageBuffer = fs.readFileSync(imagePaths[1])
        targetImageBuffer = fs.readFileSync(imagePaths[2])
        billGatesBuffer = fs.readFileSync(imagePaths[3])
        moderationBuffer = fs.readFileSync(imagePaths[4])
    })

    describe('detect labels', async function () {
        context('with an s3 image', async function () {
            it('should response ok and have labels', async function () {
                const imageLabels = await rekognition.detectLabels(imageFile)

                expect(imageLabels).to.have.property('Labels')
                expect(imageLabels.Labels).to.be.an('array')
                imageLabels.Labels.forEach(function (element) {
                    expect(element).to.have.property('Name')
                    expect(element).to.have.property('Confidence')
                })
            })
        })

        context('with an image Buffer', async function () {
            it('should response ok and have labels', async function () {
                const imageLabels = await rekognition.detectLabels(imageBuffer)

                expect(imageLabels).to.have.property('Labels')
                expect(imageLabels.Labels).to.be.an('array')
                imageLabels.Labels.forEach(function (element) {
                    expect(element).to.have.property('Name')
                    expect(element).to.have.property('Confidence')
                })
            })
        })
    })

    describe('detect faces', async function () {
        context('with an s3 image', async function () {
            it('should response ok and have details', async function () {
                const imageFaces = await rekognition.detectFaces(imageFile)

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
        })

        context('with an image Buffer', async function () {
            it('should response ok and have details', async function () {
                const imageFaces = await rekognition.detectFaces(imageBuffer)

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
        })
    })

    describe('compare faces', async function () {
        context('with an s3 image', async function () {
            it('of Mark_Zuckerberg and Mark_Zuckerberg_and_wife2 should match and unmatch', async function () {
                const faceMatches = await rekognition.compareFaces(sourceImageFile, targetImageFile)

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

            it('of Mark_Zuckerberg and Bill_Gates should unmatch', async function () {
                const faceMatches = await rekognition.compareFaces(sourceImageFile, billGatesFile)

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
        })

        context('with an image buffer', async function () {
            it('of Mark_Zuckerberg and Mark_Zuckerberg_and_wife2 should match and unmatch', async function () {
                const faceMatches = await rekognition.compareFaces(sourceImageBuffer, targetImageBuffer)

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

            it('of Mark_Zuckerberg and Bill_Gates should unmatch', async function () {
                const faceMatches = await rekognition.compareFaces(sourceImageBuffer, billGatesBuffer)

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
        })
    })

    describe('detect moderation labels', async function () {
        context('with an s3 image', async function () {
            it(' should response ok and have details', async function () {
                const moderationLabels = await rekognition.detectModerationLabels(moderationFile)

                expect(moderationLabels).to.have.property('ModerationLabels')
                expect(moderationLabels.ModerationLabels).to.be.an('array')
                moderationLabels.ModerationLabels.forEach(function (element) {
                    expect(element).to.have.property('Name')
                    expect(element).to.have.property('Confidence')
                    expect(element).to.have.property('ParentName')
                })
            })
        })

        context('with an image buffer', async function () {
            it(' should response ok and have details', async function () {
                const moderationLabels = await rekognition.detectModerationLabels(moderationBuffer)

                expect(moderationLabels).to.have.property('ModerationLabels')
                expect(moderationLabels.ModerationLabels).to.be.an('array')
                moderationLabels.ModerationLabels.forEach(function (element) {
                    expect(element).to.have.property('Name')
                    expect(element).to.have.property('Confidence')
                    expect(element).to.have.property('ParentName')
                })
            })
        })

    })



    it('create collection should response ok', async function () {
        const collection = await rekognition.createCollection(collectionId)

        expect(collection).to.have.property('CollectionArn')
        expect(collection).to.have.property('StatusCode')
        expect(collection.StatusCode).to.be.equal(200)
    })

    it('index faces of Mark_Zuckerberg_and_wife2 should response ok', async function () {
        const facesIndexed = await rekognition.indexFaces(collectionId, targetImageFile)

        expect(facesIndexed).to.have.property('FaceRecords')
        expect(facesIndexed.FaceRecords.length).to.be.equal(2)
        facesIndexed.FaceRecords.forEach(function (face) {
            expect(face).to.have.property('Face')
            expect(face).to.have.property('FaceDetail')
        })
    })

    it('search faces by faceId should response ok', async function () {
        const facesIndexed = await rekognition.indexFaces(collectionId, sourceImageFile)
        const newFaceId = facesIndexed.FaceRecords[0].Face.FaceId

        const faceMatches = await rekognition.searchFacesByFaceId(collectionId, newFaceId)

        expect(faceMatches).to.have.property('FaceMatches')
        expect(faceMatches.FaceMatches.length).to.be.equal(1)
        faceMatches.FaceMatches.forEach(function (face) {
            expect(face).to.have.property('Face')
            expect(face).to.have.property('Similarity')
        })
    })

    it('search faces by image should response ok', async function () {
        const faceMatches = await rekognition.searchFacesByImage(collectionId, sourceImageFile)

        expect(faceMatches).to.have.property('FaceMatches')
        expect(faceMatches.FaceMatches.length).to.be.equal(2)
        faceMatches.FaceMatches.forEach(function (face) {
            expect(face).to.have.property('Face')
            expect(face).to.have.property('Similarity')
        })
    })

    it('list faces should response ok', async function () {
        const faces = await rekognition.listFaces(collectionId)

        expect(faces).to.have.property('Faces')
        expect(faces.Faces.length).to.be.equal(3)
        faces.Faces.forEach(function (face) {
            expect(face).to.have.property('FaceId')
            expect(face).to.have.property('ImageId')
        })
    })

    it('delete collection should response ok', async function () {
        const collection = await rekognition.deleteCollection(collectionId)

        expect(collection).to.have.property('StatusCode')
        expect(collection.StatusCode).to.be.equal(200)
    })
})
