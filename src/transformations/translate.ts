import Coordinate from '../coordinate'
import Transformation from './transformation'

export default class Translate extends Transformation {
  constructor(
    public offset: Coordinate,
  ) {
    super()
  }
}
