import Coordinate from '../coordinate'
import Segment from './segment'

export default class Rapid extends Segment {
  constructor(
    public outCoord: Coordinate,
    public incremental: boolean = false,
  ) {
    super()
  }
}
