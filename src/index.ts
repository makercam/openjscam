/// <reference path="./index.d.ts" />
// import 'three'

import GCode from './postprocessors/gcode'
import State from './state'
import viewer from './viewer'
import * as util from './utils'
export { IMPERIAL, METRIC } from './constants'

const postProcessor = new GCode()
export const state = new State(postProcessor)
export const units = state.setUnits.bind(state)
export const tool = state.setTool.bind(state)
export const resolution = state.setResolution.bind(state)
export const feed = state.setFeedRate.bind(state)
export const speed = state.setSpeed.bind(state)
export const cut = state.cut.bind(state)
export const icut = state.icut.bind(state)
export const rapid = state.rapid.bind(state)
export const irapid = state.irapid.bind(state)
export const dwell = state.dwell.bind(state)
export const rotate = state.rotate.bind(state)
export const scale = state.scale.bind(state)
export const translate = state.translate.bind(state)
export const arc = state.arc.bind(state)
export const radiusArc = state.radiusArc.bind(state)
export const ellipse = state.ellipse.bind(state)
export const save = state.save.bind(state)
export const log = state.log.bind(state)
export const reset = state.reset.bind(state)

export const utils = util

export function gcode() {
    return state.gcode
}

export function helix(radius: number, depth: number, depthPerCut: number, zSafe: number) {
    irapid({ x: -radius })
    const totalArcs = Math.ceil(depth / depthPerCut)
    for (var i = 0; i < totalArcs; i++) {
        let cutDepth = depthPerCut
        if (i + 1 === totalArcs) {
            cutDepth = depth - (depthPerCut * i)
        }
        arc({ x: radius, z: -cutDepth }, 360)
    }
    arc({ x: radius }, 360)
    rapid({ z: zSafe })
    irapid({ x: radius })
}

export function drill(depth: number, depthPerCut: number, zSafe: number) {
    const totalCuts = Math.ceil(depth / depthPerCut)
    for (var i = 1; i <= totalCuts; i++) {
        let cutDepth = depthPerCut * i
        if (cutDepth > depth) {
            cutDepth = depth
        }
        cut({ z: -cutDepth })
        rapid({ z: zSafe })
    }
}

export function view(containerEl?: HTMLElement) {
    viewer(state, containerEl)
}