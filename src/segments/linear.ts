import Coordinate from '../coordinate'
import Segment from './segment'

export default class Linear extends Segment {
  constructor(
    public outCoord: Coordinate,
    public feedRate: number,
    public incremental: boolean = false,
  ) {
    super()
  }
}
