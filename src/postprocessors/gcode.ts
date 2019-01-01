import { IMPERIAL, Unit } from '../constants'
import Coordinate from '../coordinate'
import { coordToString, round } from '../utils'
import PostProcessor from './postprocessor'

export default class GcodePostProcessor implements PostProcessor {
  write(command: string) {
    return command
  }

  dwell(duration: number) {
    return `G4 P${duration}`
  }

  feed(feedRate: number) {
    return `F${feedRate}`
  }

  speed(speed: number) {
    return `M3 S${speed}`
  }

  units(units: Unit) {
    return units === IMPERIAL ? 'G20' : 'G21'
  }

  rapid(coord: Coordinate) {
    return `G0 ${coordToString(coord)}`
  }

  cut(coord: Coordinate) {
    return `G1 ${coordToString(coord)}`
  }

  arc(endOffset: Coordinate, centerOffset: Coordinate, cw: boolean) {
    return `${cw ? 'G2' : 'G3'} ${coordToString(endOffset)} I${round(centerOffset.x || 0)} J${round(centerOffset.y || 0)}`
  }
}