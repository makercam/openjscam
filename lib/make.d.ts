import * as maker from 'makerjs';
interface Make {
    union: typeof maker.model.combineUnion;
    difference: typeof maker.model.combineSubtraction;
    intersection: typeof maker.model.combineIntersection;
    move: typeof maker.model.move;
    rotate: typeof maker.model.rotate;
    scale: typeof maker.model.scale;
    distort: typeof maker.model.distort;
    moveRelative: typeof maker.model.moveRelative;
    offset: (modelToOutline: maker.IModel, offset: number, joints?: number) => maker.IModel;
    raster: (modelToRasterize: maker.IModel, margin: number, offset?: number) => maker.IModel;
    toKeyPoints: (drawing: maker.IModel, tolerance?: number) => maker.IPoint[];
}
declare const make: Make;
export default make;
