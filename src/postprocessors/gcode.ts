import { IMPERIAL, Unit } from '../constants'
import Coordinate from '../coordinate'
import Arc from '../segments/arc'
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

  arc(arc: Arc, lastCoord: Coordinate) {
    const outCoord = arc.getOutCoordForInCoord(lastCoord)
    const centerCoord: Coordinate = {
      x: lastCoord.x! + (arc.offset.x || 0),
      y: lastCoord.y! + (arc.offset.y || 0),
    }
    const i = round(centerCoord.x! - lastCoord.x!)
    const j = round(centerCoord.y! - lastCoord.y!)
    return `${arc.angle > 0 ? 'G2' : 'G3'} ${coordToString(outCoord)} I${i} J${j}`
  }
}