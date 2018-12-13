import Coordinate from '../coordinate'
import Transformation from './transformation'

export default class Scale extends Transformation {
  constructor(
    public scales: Coordinate,
  ) {
    super()
  }
}
