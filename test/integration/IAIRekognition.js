'use strict'

const expect = require('chai').expect
const IAIRekognition = require('../../index')
const parameters = require('../../parameters')

const debug = require('debug')('IAIRekognition:test:IAIRekognition')

const imagePath = __dirname + '/../../images/run.jpg'
const iAIRekognition = new IAIRekognition(parameters.AWS)

describe('IAIRekognition', function () {
    it('detect labels should response ok and have labels', async function () {
        this.timeout(10000)
        const imageLabels = await iAIRekognition.detectLabels(imagePath, parameters.defaultFolder)

        expect(imageLabels).to.have.property('Labels')
        expect(imageLabels.Labels).to.be.an('array')
        imageLabels.Labels.forEach(function(element) {
            expect(element).to.have.property('Name')
            expect(element).to.have.property('Confidence')
        })
    })

    it('detect faces should response ok and have details', async function () {
        this.timeout(10000)
        const imageFaces = await iAIRekognition.detectFaces(imagePath, parameters.defaultFolder)
        
        expect(imageFaces).to.have.property('FaceDetails')
        expect(imageFaces.FaceDetails).to.be.an('array')
        imageFaces.FaceDetails.forEach(function(element) {
            expect(element).to.have.property('BoundingBox')
            expect(element).to.have.property('Landmarks')
            expect(element).to.have.property('Pose')
            expect(element).to.have.property('Quality')
            expect(element).to.have.property('Confidence')
        })
    })

    it('compare faces of Mark_Zuckerberg and Mark_Zuckerberg_and_wife2 should match and unmatch', async function () {
        this.timeout(10000)
        const sourceImagePath = __dirname + '/../../images/Mark_Zuckerberg.jpg'
        const targetImagePath = __dirname + '/../../images/Mark_Zuckerberg_and_wife2.jpg'
        const faceMatches = await iAIRekognition.compareFaces(sourceImagePath, targetImagePath, parameters.defaultFolder)
        
        expect(faceMatches).to.have.property('FaceMatches')
        expect(faceMatches).to.have.property('UnmatchedFaces')
        expect(faceMatches.FaceMatches).to.be.an('array')
        expect(faceMatches.UnmatchedFaces).to.be.an('array')
        expect(faceMatches.FaceMatches.length).to.be.equal(1)
        expect(faceMatches.UnmatchedFaces.length).to.be.equal(1)
        faceMatches.FaceMatches.forEach(function(element) {
            expect(element).to.have.property('Similarity')
            expect(element).to.have.property('Face')
        })
    })

    it('compare faces of Mark_Zuckerberg and Bill_Gates should unmatch', async function () {
        this.timeout(10000)
        const sourceImagePath = __dirname + '/../../images/Mark_Zuckerberg.jpg'
        const targetImagePath = __dirname + '/../../images/Bill_Gates.jpg'
        const faceMatches = await iAIRekognition.compareFaces(sourceImagePath, targetImagePath, parameters.defaultFolder)
        
        expect(faceMatches).to.have.property('FaceMatches')
        expect(faceMatches).to.have.property('UnmatchedFaces')
        expect(faceMatches.FaceMatches).to.be.an('array')
        expect(faceMatches.UnmatchedFaces).to.be.an('array')
        expect(faceMatches.FaceMatches.length).to.be.equal(0)
        expect(faceMatches.UnmatchedFaces.length).to.be.equal(1)
        faceMatches.FaceMatches.forEach(function(element) {
            expect(element).to.have.property('Similarity')
            expect(element).to.have.property('Face')
        })
    })
})
