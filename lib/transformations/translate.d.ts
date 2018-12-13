import Coordinate from '../coordinate';
import Transformation from './transformation';
export default class Translate extends Transformation {
    offset: Coordinate;
    constructor(offset: Coordinate);
}
