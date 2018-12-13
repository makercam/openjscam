import Transformation from './transformation'

export default class Rotate extends Transformation {
  constructor(
    public angle: number,
  ) {
    super()
  }
}
