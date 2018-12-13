import Coordinate from '../coordinate';
import Transformation from './transformation';
export default class Scale extends Transformation {
    scales: Coordinate;
    constructor(scales: Coordinate);
}
