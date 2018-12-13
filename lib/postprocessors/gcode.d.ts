import { Unit } from '../constants';
import Coordinate from '../coordinate';
import Arc from '../segments/arc';
import PostProcessor from './postprocessor';
export default class GcodePostProcessor implements PostProcessor {
    write(command: string): string;
    dwell(duration: number): string;
    feed(feedRate: number): string;
    speed(speed: number): string;
    units(units: Unit): "G20" | "G21";
    rapid(coord: Coordinate): string;
    cut(coord: Coordinate): string;
    arc(arc: Arc, lastCoord: Coordinate): string;
}
