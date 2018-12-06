import Segment from './segment'

export default class Rotate extends Segment {
  constructor(
    public segments: Segment[],
    public angle: number,
  ) {
    super()
  }
}
