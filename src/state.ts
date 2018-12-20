import fs from 'fs'
import * as THREE from 'three'

import { Plane, Unit, XZ } from './constants'
import Coordinate from './coordinate'
import PostProcessor from './postprocessors/postprocessor'
import Arc from './segments/arc'
import Ellipse from './segments/ellipse'
import Rotate from './transformations/rotate'
import Scale from './transformations/scale'
import Transformation from './transformations/transformation'
import Translate from './transformations/translate'
import { axes, mergeCoords, roundCoord, sumCoords, toRadians } from './utils'
import Arc2 from './segments/arc2';

export default class State {
    constructor(public postProcessor: PostProcessor) {}

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
        this.lastUntransformedCoord = { x: 0, y: 0, z: 0 }
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

    applyTransformations(coordinate: Coordinate, transformations: Transformation[] | null = null) {
        let newCoord = coordinate
        let transformationsToApply = transformations
        if (transformationsToApply === null) {
            transformationsToApply = this.transformations
        }
        transformationsToApply.forEach(transformation => {
            newCoord = this.applyTransformation(newCoord, transformation)
        })
        return newCoord
    }

    applyTransformation(coord: Coordinate, transformation: Transformation): Coordinate {
        let newCoord: Coordinate = {}
        if (transformation instanceof Translate) {
          var translated = new THREE.Vector3(coord.x, coord.y, coord.z);
          translated.add(new THREE.Vector3(transformation.offset.x, transformation.offset.y, transformation.offset.z))
          if (coord.x !== undefined) {
            newCoord.x = translated.x
          }
          if (coord.y !== undefined) {
            newCoord.y = translated.y
          }
          if (coord.z !== undefined) {
            newCoord.z = translated.z
          }
        }
        if (transformation instanceof Rotate) {
          var rotated = new THREE.Vector3(coord.x, coord.y, coord.z);
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
        const transformedCoord = roundCoord(this.applyTransformations(coordinate), 10000)
        const cleanedCoord = this.removeRedundantCoords(transformedCoord)
        if (cleanedCoord === null) return
        this.shapes.push(new THREE.LineCurve3(
            new THREE.Vector3(this.lastCoord.x, this.lastCoord.y, this.lastCoord.z),
            new THREE.Vector3(transformedCoord.x || this.lastCoord.x, transformedCoord.y || this.lastCoord.y, transformedCoord.z || this.lastCoord.z)
        ))
        this.write(this.postProcessor.cut(cleanedCoord))
        this.updateLastCoord(transformedCoord)
        this.updateLastUntransformedCoord(coordinate)
    }

    icut(offset: Coordinate) {
        if (!this.feedRate) {
            throw new Error('No feedrate given, please call `feed()` before cut')
        }
        const absOffset = sumCoords(this.lastUntransformedCoord, offset)
        const transformedOffset = roundCoord(this.applyTransformations(absOffset), 10000)
        const cleanedCoord = this.removeRedundantCoords(transformedOffset)
        if (cleanedCoord === null) return
        this.shapes.push(new THREE.LineCurve3(
            new THREE.Vector3(this.lastCoord.x, this.lastCoord.y, this.lastCoord.z),
            new THREE.Vector3(transformedOffset.x || this.lastCoord.x, transformedOffset.y || this.lastCoord.y, transformedOffset.z || this.lastCoord.z)
        ))
        this.write(this.postProcessor.cut(cleanedCoord))
        this.updateLastCoord(transformedOffset)
        this.updateLastUntransformedCoord(absOffset)
    }

    rapid(coordinate: Coordinate) {
        const transformedCoord = roundCoord(this.applyTransformations(coordinate), 10000)
        const cleanedCoord = this.removeRedundantCoords(transformedCoord)
        if (cleanedCoord === null) return
        const shape = new THREE.LineCurve3(
            new THREE.Vector3(this.lastCoord.x, this.lastCoord.y, this.lastCoord.z),
            new THREE.Vector3(transformedCoord.x || this.lastCoord.x, transformedCoord.y || this.lastCoord.y, transformedCoord.z || this.lastCoord.z)
        )
        shape.isRapid = true
        this.shapes.push(shape)
        this.write(this.postProcessor.rapid(cleanedCoord))
        this.updateLastCoord(transformedCoord)
        this.updateLastUntransformedCoord(coordinate)
    }

    irapid(offset: Coordinate) {
        const absOffset = sumCoords(this.lastUntransformedCoord, offset)
        const transformedOffset = roundCoord(this.applyTransformations(absOffset), 10000)
        const cleanedCoord = this.removeRedundantCoords(transformedOffset)
        if (cleanedCoord === null) return
        const shape = new THREE.LineCurve3(
            new THREE.Vector3(this.lastCoord.x, this.lastCoord.y, this.lastCoord.z),
            new THREE.Vector3(transformedOffset.x || this.lastCoord.x, transformedOffset.y || this.lastCoord.y, transformedOffset.z || this.lastCoord.z)
        )
        shape.isRapid = true
        this.shapes.push(shape)
        this.write(this.postProcessor.rapid(cleanedCoord))
        this.updateLastCoord(transformedOffset)
        this.updateLastUntransformedCoord(absOffset)
    }

    dwell(duration: number) {
        this.write(this.postProcessor.dwell(duration))
    }

    arc(offset: Coordinate, angle: number, plane: Plane = XZ) {
        if (!this.feedRate) {
            throw new Error('No feedrate given, please call `feed()` before cut')
        }
        const transformedOffset = this.applyTransformations(offset, this.transformations.filter(t => { return !(t instanceof Translate) }))
        const arc = new Arc(transformedOffset, angle, plane)
        this.write(this.postProcessor.arc(arc, this.lastCoord))
        const outCoord = arc.getOutCoordForInCoord(this.lastCoord)
        this.shapes.push(arc.getCurveForInCoord(this.lastCoord))
        this.updateLastCoord(mergeCoords(this.lastCoord, outCoord))
        const untransformedArc = new Arc(offset, angle, plane)
        const untransformedOutCoord = untransformedArc.getOutCoordForInCoord(this.lastUntransformedCoord)
        this.updateLastUntransformedCoord(mergeCoords(this.lastUntransformedCoord, untransformedOutCoord))
    }

    radiusArc(center: Coordinate, radius: number, startAngle: number, angle: number, plane: Plane = XZ) {
        if (!this.feedRate) {
            throw new Error('No feedrate given, please call `feed()` before cut')
        }
        const arc = new Arc2(radius, startAngle, angle, plane)
        const offset = arc.getOffset()
        const absOffset = sumCoords(this.lastUntransformedCoord, offset)
        const transformedOffset = this.applyTransformations(absOffset, this.transformations.filter(t => { return !(t instanceof Translate) }))
        this.write(this.postProcessor.arc2(arc, this.lastCoord))
        this.shapes.push(arc.getCurve())
        this.updateLastCoord(mergeCoords(this.lastCoord, transformedOffset))
        this.updateLastUntransformedCoord(mergeCoords(this.lastUntransformedCoord, absOffset))
    }

    ellipse(radiusX: number, radiusY: number, offsetZ: number = 0, angle: number, angleStart = 0, points: number = 50, plane: Plane = XZ) {
        if (!this.feedRate) {
            throw new Error('No feedrate given, please call `feed()` before cut')
        }
        const ellipse = new Ellipse(radiusX, radiusY, offsetZ, angle, angleStart, points, plane)
        const coords = ellipse.getCoords()
        const gcodes = coords.map(coord => this.postProcessor.cut(sumCoords(this.lastCoord, coord)))
        this.writeBatch(gcodes)
        const outCoord = sumCoords(this.lastCoord, coords[coords.length - 1])
        this.updateLastCoord(mergeCoords(this.lastCoord, outCoord))
    }

    translate(offset: Coordinate, cb = () => {}) {
        const transformation = new Translate(offset)
        this.transformations.unshift(transformation)
        cb()
        this.transformations.splice(this.transformations.indexOf(transformation), 1);
    }

    rotate(angle: number, cb = () => {}) {
        const transformation = new Rotate(angle)
        this.transformations.unshift(transformation)
        cb()
        this.transformations.splice(this.transformations.indexOf(transformation), 1);
    }

    scale(scales: Coordinate, cb = () => {}) {
        const transformation = new Scale(scales)
        this.transformations.unshift(transformation)
        cb()
        this.transformations.splice(this.transformations.indexOf(transformation), 1);
    }

    write(command: string) {
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