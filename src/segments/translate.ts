import Coordinate from '../coordinate'
import Segment from './segment'

export default class Translate extends Segment {
  constructor(
    public segments: Segment[],
    public offset: Coordinate,
  ) {
    super()
  }
}
