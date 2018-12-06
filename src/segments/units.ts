import { Unit } from '../constants'
import Segment from './segment'

export default class Units extends Segment {
  constructor(
    public units: Unit
  ) {
    super()
  }
}
