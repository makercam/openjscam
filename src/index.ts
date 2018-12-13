/// <reference path="./index.d.ts" />
import GCode from './postprocessors/gcode'
import State from './state'

export { IMPERIAL, METRIC } from './constants'

const postProcessor = new GCode()
export const state = new State(postProcessor)
export const units = state.setUnits.bind(state)
export const tool = state.setTool.bind(state)
export const feed = state.setFeedRate.bind(state)
export const speed = state.setSpeed.bind(state)
export const cut = state.cut.bind(state)
export const icut = state.icut.bind(state)
export const rapid = state.rapid.bind(state)
export const irapid = state.irapid.bind(state)
export const dwell = state.dwell.bind(state)
export const translate = state.translate.bind(state)
export const rotate = state.rotate.bind(state)
export const scale = state.scale.bind(state)
export const arc = state.arc.bind(state)
export const ellipse = state.ellipse.bind(state)
export const save = state.save.bind(state)
export const log = state.log.bind(state)
export const reset = state.reset.bind(state)
export function gcode() {
    return state.gcode
}