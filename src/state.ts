// @ts-ignore
import fs from 'fs'
import * as THREE from 'three'

import { Plane, Unit, XY } from './constants'
import Coordinate from './coordinate'
import PostProcessor from './postprocessors/postprocessor'
import Arc from './segments/arc'
import Ellipse from './segments/ellipse'
import Rotate from './transformations/rotate'
import Scale from './transformations/scale'
import Transformation from './transformations/transformation'
import { axes, mergeCoords, roundCoord, sumCoords, toRadians } from './utils'
import RadiusArc from './segments/radiusArc';
import Translate from './transformations/translate';

export default class State {
    constructor(public postProcessor: PostProcessor) {}

    public resolution: number = 0.1
    public tool: number | undefined
    public units: Unit | undefined
    public feedRate: number | undefined
    public speed: number | undefined
    public lastCoord: Coordinate = { x: 0, y: 0, z: 0 }
    public lastUntransformedCoord: Coordinate = { x: 0, y: 0, z: 0 }
    public transformations: Transformation[] = []
    public gcode: string[][] = []
    public shapes: (THREE.Vector | THREE.Curve<THREE.Vector>)[] = []

    reset() {
        this.tool = undefined
        this.units = undefined
        this.feedRate = undefined
        this.speed = undefined
        this.lastCoord = { x: 0, y: 0, z: 0 }
        this.transformations = []
        this.gcode = []
    }

    updateLastCoord(coord: Coordinate) {
      axes.forEach(c => {
        if (coord[c] !== undefined) {
          this.lastCoord[c] = coord[c]
        }
      })
    }

    updateLastUntransformedCoord(coord: Coordinate) {
      axes.forEach(c => {
        if (coord[c] !== undefined) {
          this.lastUntransformedCoord[c] = coord[c]
        }
      })
    }

    removeRedundantCoords(coord: Coordinate) {
        const newCoord: Coordinate = {}
        axes.forEach(axis => {
            if (this.lastCoord[axis] !== coord[axis] && coord[axis] !== undefined) {
                newCoord[axis] = coord[axis]
            }
        })
        if (Object.keys(newCoord).length === 0) {
            return null
        }
        return newCoord
    }

    applyTransformations(coordinate: Coordinate, transformations: Transformation[] | null = null, isIncremental = false) {
        let newCoord = coordinate
        let transformationsToApply = transformations
        if (transformationsToApply === null) {
            transformationsToApply = this.transformations
        }
        transformationsToApply.forEach(transformation => {
            newCoord = this.applyTransformation(newCoord, transformation, isIncremental)
        })
        return newCoord
    }

    applyTransformation(coord: Coordinate, transformation: Transformation, isIncremental = false): Coordinate {
        let newCoord: Coordinate = {}
        if (transformation instanceof Translate && !isIncremental) {
            var translated = new THREE.Vector3(coord.x, coord.y, coord.z);
            translated.add(new THREE.Vector3(transformation.offset.x || 0, transformation.offset.y || 0, transformation.offset.z || 0))
            if (coord.x !== undefined) {
                newCoord.x = translated.x
            }
            if (coord.y !== undefined) {
                newCoord.y = translated.y
            }
            if (coord.z !== undefined) {
                newCoord.z = translated.z
            }
        } else if (isIncremental) {
            newCoord = coord
        }
        if (transformation instanceof Rotate) {
          var rotated = new THREE.Vector3(
              coord.x === undefined ? this.lastCoord.x : coord.x,
              coord.y === undefined ? this.lastCoord.y : coord.y,
              coord.z === undefined ? this.lastCoord.z : coord.z,
          );
          rotated.applyAxisAngle(new THREE.Vector3(0, 0, 1), -toRadians(transformation.angle))
          newCoord = {
            x: rotated.x,
            y: rotated.y,
            z: rotated.z
          }
        }
        if (transformation instanceof Scale) {
          var scaled = new THREE.Vector3(coord.x, coord.y, coord.z);
          var matrix = new THREE.Matrix4();
          matrix.makeScale(transformation.scales.x || 1, transformation.scales.y || 1, transformation.scales.z || 1)
          scaled.applyMatrix4(matrix)
          newCoord = {
            x: scaled.x,
            y: scaled.y,
            z: scaled.z
          }
        }
        return newCoord
    }

    setPostProcessor(postProcessor: PostProcessor) {
        this.postProcessor = postProcessor
    }

    setTool(tool: number) {
        this.tool = tool
    }

    setResolution(resolution: number) {
        this.resolution = resolution
    }
    
    setUnits(units: Unit) {
        this.units = units
        this.write(this.postProcessor.units(units))
    }

    setFeedRate(feedRate: number) {
        this.feedRate = feedRate
        this.write(this.postProcessor.feed(feedRate))
    }

    setSpeed(speed: number) {
        this.speed = speed
        this.write(this.postProcessor.speed(speed))
    }

    cut(coordinate: Coordinate) {
        if (!this.feedRate) {
            throw new Error('No feedrate given, please call `feed()` before cut')
        }
        const fullCoord = this.fillCoordWithLastCoord(coordinate)
        const transformedCoord = roundCoord(this.applyTransformations(fullCoord), 10000)
        const cleanedCoord = this.removeRedundantCoords(transformedCoord)
        if (cleanedCoord === null) return
        this.shapes.push(new THREE.LineCurve3(
            new THREE.Vector3(this.lastCoord.x, this.lastCoord.y, this.lastCoord.z),
            new THREE.Vector3(transformedCoord.x, transformedCoord.y, transformedCoord.z)
        ))
        this.write(this.postProcessor.cut(cleanedCoord))
        this.updateLastCoord(transformedCoord)
        this.updateLastUntransformedCoord(mergeCoords(this.lastUntransformedCoord, fullCoord))
    }

    icut(offset: Coordinate) {
        if (!this.feedRate) {
            throw new Error('No feedrate given, please call `feed()` before cut')
        }
        const fullOffset = this.fillCoordWithZeros(offset)
        const transformedOffset = roundCoord(this.applyTransformations(fullOffset, null, true), 10000)
        const transformedEndCoord = sumCoords(this.lastCoord, transformedOffset)
        const cleanedCoord = this.removeRedundantCoords(transformedEndCoord)
        if (cleanedCoord === null) return
        this.shapes.push(new THREE.LineCurve3(
            new THREE.Vector3(this.lastCoord.x, this.lastCoord.y, this.lastCoord.z),
            new THREE.Vector3(transformedEndCoord.x, transformedEndCoord.y, transformedEndCoord.z)
        ))
        this.write(this.postProcessor.cut(cleanedCoord))
        this.updateLastCoord(transformedEndCoord)
        this.updateLastUntransformedCoord(sumCoords(this.lastUntransformedCoord, fullOffset))
    }

    fillCoordWithLastCoord(coordinate: Coordinate) {
        return {
            x: coordinate.x === undefined ? this.lastCoord.x : coordinate.x,
            y: coordinate.y === undefined ? this.lastCoord.y : coordinate.y,
            z: coordinate.z === undefined ? this.lastCoord.z : coordinate.z
        }
    }

    fillCoordWithZeros(coordinate: Coordinate) {
        return {
            x: coordinate.x === undefined ? 0 : coordinate.x,
            y: coordinate.y === undefined ? 0 : coordinate.y,
            z: coordinate.z === undefined ? 0 : coordinate.z
        }
    }

    rapid(coordinate: Coordinate) {
        const fullCoord = this.fillCoordWithLastCoord(coordinate)
        const transformedCoord = roundCoord(this.applyTransformations(fullCoord), 10000)
        const cleanedCoord = this.removeRedundantCoords(transformedCoord)
        if (cleanedCoord === null) return
        const shape = new THREE.LineCurve3(
            new THREE.Vector3(this.lastCoord.x, this.lastCoord.y, this.lastCoord.z),
            new THREE.Vector3(transformedCoord.x, transformedCoord.y, transformedCoord.z)
        )
        // @ts-ignore
        shape.isRapid = true
        this.shapes.push(shape)
        this.write(this.postProcessor.rapid(cleanedCoord))
        this.updateLastCoord(transformedCoord)
    }

    irapid(offset: Coordinate) {
        const fullOffset = this.fillCoordWithZeros(offset)
        const transformedOffset = roundCoord(this.applyTransformations(fullOffset, null, true), 10000)
        const endCoord = sumCoords(this.lastCoord, transformedOffset)
        const cleanedCoord = this.removeRedundantCoords(endCoord)
        if (cleanedCoord === null) return
        const shape = new THREE.LineCurve3(
            new THREE.Vector3(this.lastCoord.x, this.lastCoord.y, this.lastCoord.z),
            new THREE.Vector3(endCoord.x, endCoord.y, endCoord.z)
        )
        // @ts-ignore
        shape.isRapid = true
        this.shapes.push(shape)
        this.write(this.postProcessor.rapid(cleanedCoord))
        this.updateLastCoord(endCoord)
    }

    dwell(duration: number) {
        this.write(this.postProcessor.dwell(duration))
    }

    hasTransformation(transformationType: Transformation) {
        // @ts-ignore
        return this.transformations.filter(t => t instanceof transformationType)
            .length > 0
    }

    arc(centerOffset: Coordinate, angle: number, plane: Plane = XY) {
        if (!this.feedRate) {
            throw new Error('No feedrate given, please call `feed()` before cut')
        }
        if (this.hasTransformation(Scale)) {
            const a = centerOffset.x || 0
            const b = centerOffset.y || 0
            const radius = Math.sqrt(a * a + b * b)
            const angleStart = (Math.atan2(0-a, 0-b) * 180 / Math.PI)
            return this.ellipse(radius, radius, 0, angleStart + angle, angleStart)
        }
        const transformedOffset = roundCoord(
            this.applyTransformations(
                this.fillCoordWithZeros(centerOffset),
                null,
                true
            )
        )
        const transformedArc = new Arc(transformedOffset, angle, plane)
        const transformedEndOffset = transformedArc.getOffset()
        const absEndOffset = sumCoords(this.lastCoord, transformedEndOffset)
        this.write(this.postProcessor.arc(absEndOffset, transformedOffset, angle > 0))
        const curve = transformedArc.getCurveForInCoord(this.lastCoord)
        this.shapes.push(curve)
        this.updateLastCoord(absEndOffset)
    }

    radiusArc(radius: number, startAngle: number, endAngle: number, plane: Plane = XY) {
        if (!this.feedRate) {
            throw new Error('No feedrate given, please call `feed()` before cut')
        }
        if (this.hasTransformation(Scale)) {
            return this.ellipse(radius, radius, 0, endAngle, startAngle)
        }
        this.transformations.forEach(t => {
            if (t instanceof Rotate) {
                startAngle += t.angle
                endAngle += t.angle
            }
        })
        const transformedArc = new RadiusArc(radius, startAngle, endAngle, plane)
        const transformedEndOffset = transformedArc.getOffset()
        const transformedCenterOffset = transformedArc.getCenterOffset()
        const absEndOffset = sumCoords(this.lastCoord, transformedEndOffset)
        this.write(this.postProcessor.arc(absEndOffset, transformedCenterOffset, startAngle < endAngle))
        const curve = transformedArc.getCurveForInCoord(this.lastCoord)
        this.shapes.push(curve)
        this.updateLastCoord(roundCoord(mergeCoords(this.lastCoord, absEndOffset)))
    }

    ellipse(radiusX: number, radiusY: number, offsetZ: number = 0, angle: number, angleStart = 0, points?: number, plane: Plane = XY) {
        if (!this.feedRate) {
            throw new Error('No feedrate given, please call `feed()` before cut')
        }
        this.transformations.forEach(t => {
            if (t instanceof Rotate) {
                angle += t.angle
                angleStart += t.angle
            }
            if (t instanceof Scale) {
                radiusX = radiusX * (t.scales.x || 1)
                radiusY = radiusY * (t.scales.y || 1)
                offsetZ = offsetZ * (t.scales.z || 1)
            }
        })
        const ellipse = new Ellipse(radiusX, radiusY, offsetZ, angle, angleStart, plane)
        if (!points) {
            const length = ellipse.curve.getLength()
            points = length / this.resolution
            if (points < 3) {
                points = 2
            }
        }
        const coords = ellipse.getCoords(points)
        const gcodes = coords.map(coord => {
            const absCoord = sumCoords(this.lastCoord, coord)
            const cleanedCoord = this.removeRedundantCoords(absCoord)
            return this.postProcessor.cut(cleanedCoord === null ? absCoord : cleanedCoord)
        })
        this.writeBatch(gcodes)
        const absCoord = sumCoords(this.lastCoord, coords[coords.length - 1])
        this.shapes.push(ellipse.getCurveForInCoord(this.lastCoord))
        this.updateLastCoord(absCoord)
    }

    rotate(angle: number, cb = () => {}) {
        const transformation = new Rotate(angle)
        this.transformations.unshift(transformation)
        cb()
        this.transformations.splice(this.transformations.indexOf(transformation), 1);
        this.lastUntransformedCoord = this.lastCoord
    }

    scale(scales: Coordinate | number, cb = () => {}) {
        const transformation = new Scale(typeof scales === 'number' ? { x: scales, y: scales, z: scales } : scales)
        this.transformations.unshift(transformation)
        cb()
        this.transformations.splice(this.transformations.indexOf(transformation), 1);
        this.lastUntransformedCoord = this.lastCoord
    }

    translate(offset: Coordinate, cb = () => {}) {
        const transformation = new Translate(offset)
        this.transformations.unshift(transformation)
        cb()
        this.transformations.splice(this.transformations.indexOf(transformation), 1);
        this.lastUntransformedCoord = this.lastCoord
    }

    write(command: string) {
        // helpfull for debugging
        // console.log(command)
        this.gcode.push([command])
    }

    writeBatch(commands: string[]) {
        this.gcode.push(commands)
    }

    save(path: string) {
      fs.writeFileSync(path, this.toString())
    }

    log() {
        console.log(this.toString())
    }

    toString() {
      return this.gcode.map(gcodes => gcodes.join('\n')).join('\n')
    }
}