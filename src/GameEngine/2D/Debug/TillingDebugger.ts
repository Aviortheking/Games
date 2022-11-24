/* eslint-disable max-classes-per-file */
import Component2D from 'GameEngine/Component2D'
import RectRenderer from 'GameEngine/Renderer/RectRenderer'
import Vector2D from '../Vector2D'

export default class TilingDebugger extends Component2D {
	public readonly name = 'TilingDebugger'
	public constructor() {
		super()
		for (let i0 = 0; i0 < 10; i0++) {
			for (let i1 = 0; i1 < 10; i1++) {
				this.childs.push(
					new CaseDebugger(new Vector2D(i0, i1)),
					// new CaseDebugger(new Vector2D(i0 + .5, i1 + .5)),
					// new CaseDebugger(new Vector2D(i0 + .75, i1 + .75)),
					// new CaseDebugger(new Vector2D(i0 + .25, i1 + .75)),
					// new CaseDebugger(new Vector2D(i0 + .75, i1 + .25)),
					// new CaseDebugger(new Vector2D(i0 + .25, i1 + .25))
				)
			}
		}
	}
}

class CaseDebugger extends Component2D {
	public readonly name = 'CaseDebugger'
	public renderer: RectRenderer = new RectRenderer(this, {stroke: 'black'})
	public constructor(pos: Vector2D) {
		super()
		this.position = pos
	}
}
