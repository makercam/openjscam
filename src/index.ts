import { IMPERIAL as IMP, METRIC as MET } from './constants'
import GcodeGenerator from './generator'
import State from './state'

export const state = new State()
export const units: typeof State.prototype.setUnits = state.setUnits.bind(state)
export const tool: typeof State.prototype.setTool = state.setTool.bind(state)
export const feed: typeof State.prototype.setFeedRate = state.setFeedRate.bind(state)
export const speed: typeof State.prototype.setSpeed = state.setSpeed.bind(state)
export const cut: typeof State.prototype.cut = state.cut.bind(state)
export const icut: typeof State.prototype.icut = state.icut.bind(state)
export const rapid: typeof State.prototype.rapid = state.rapid.bind(state)
export const irapid: typeof State.prototype.irapid = state.irapid.bind(state)
export const dwell: typeof State.prototype.dwell = state.dwell.bind(state)
export const translate: typeof State.prototype.translate = state.translate.bind(state)
export const rotate: typeof State.prototype.rotate = state.rotate.bind(state)
export const arc: typeof State.prototype.arc = state.arc.bind(state)

export function save(path: string): void {
    const generator = new GcodeGenerator()
    generator.generate(state.segments)
    generator.save(path)
}

export function print() {
    const generator = new GcodeGenerator()
    generator.generate(state.segments)
    console.log(generator.toString())
}

export const IMPERIAL = IMP
export const METRIC = MET