export default interface Coordinate {
    x?: number;
    y?: number;
    z?: number;
    a?: number;
    b?: number;
    c?: number;
    u?: number;
    v?: number;
    w?: number;
    [key: string]: number | undefined;
}
