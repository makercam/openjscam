import { Plane, Unit, XZ } from './constants'
import Coordinate from './coordinate'
import Arc from './segments/arc'
import Dwell from './segments/dwell'
import Feed from './segments/feed'
import Linear from './segments/linear'
import Rapid from './segments/rapid'
import Rotate from './segments/rotate'
import Segment from './segments/segment'
import Speed from './segments/speed'
import Translate from './segments/translate'
import Units from './segments/units'

export default class State {
    public tool: number | undefined
    public units: Unit | undefined
    public feedRate: number | undefined
    public speed: number | undefined
    public segments: Segment[] = []

    setTool(tool: number) {
        this.tool = tool
    }
    
    setUnits(units: Unit) {
        this.units = units
        this.segments.push(new Units(units))
    }

    setFeedRate(feedRate: number) {
        this.feedRate = feedRate
        this.segments.push(new Feed(feedRate))
    }

    setSpeed(speed: number) {
        this.speed = speed
        this.segments.push(new Speed(speed))
    }

    cut(coordinate: Coordinate) {
        if (!this.feedRate) {
            throw new Error('No feedrate given, please call `feed()` before cut')
        }
        this.segments.push(new Linear(coordinate))
    }

    rapid(coordinate: Coordinate) {
        this.segments.push(new Rapid(coordinate))
    }

    icut(coordinate: Coordinate) {
        if (!this.feedRate) {
            throw new Error('No feedrate given, please call `feed()` before cut')
        }
        this.segments.push(new Linear(coordinate, true))
    }

    irapid(coordinate: Coordinate) {
        this.segments.push(new Rapid(coordinate, true))
    }

    dwell(duration: number) {
        this.segments.push(new Dwell(duration))
    }

    arc(offset: Coordinate, angle: number, plane: Plane = XZ) {
        if (!this.feedRate) {
            throw new Error('No feedrate given, please call `feed()` before cut')
        }
        this.segments.push(new Arc(offset, angle, plane))
    }

    translate(offset: Coordinate, cb = () => {}) {
        const lastSegments = this.segments
        this.segments = []
        cb()
        const segmentsToTranslate = this.segments
        this.segments = lastSegments
        this.segments.push(new Translate(segmentsToTranslate, offset))
    }

    rotate(angle: number, cb = () => {}) {
        const lastSegments = this.segments
        this.segments = []
        cb()
        const segmentsToTranslate = this.segments
        this.segments = lastSegments
        this.segments.push(new Rotate(segmentsToTranslate, angle))
    }
}