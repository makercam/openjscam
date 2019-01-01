import { Unit } from '../constants'
import Coordinate from '../coordinate'
import Arc from '../segments/arc'

export default interface PostProcessor {
    dwell(duration: number): string
    feed(feedRate: number): string
    speed(speed: number): string
    units(units: Unit): string
    rapid(coord: Coordinate): string
    cut(coord: Coordinate): string
    arc(endOffset: Coordinate, centerOffset: Coordinate, cw: boolean): string
}