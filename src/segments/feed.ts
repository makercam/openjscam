import Segment from './segment'

export default class Feed extends Segment {
  constructor(
    public feedRate: number
  ) {
    super()
  }
}
