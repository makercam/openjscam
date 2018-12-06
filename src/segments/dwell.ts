import Segment from './segment'

export default class Dwell extends Segment {
  constructor(
    public duration: number
  ) {
    super()
  }
}
