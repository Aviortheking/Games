import Renderer from '.'
import type GameEngine from '..'

interface Params {
	renderers: Array<Renderer>
}

export default class MultiRenderer extends Renderer<Params> {

	public async render(ge: GameEngine, ctx: CanvasRenderingContext2D) {
		await super.render(ge, ctx)
		for await (const renderer of this.props.renderers) {
			await renderer.render(ge, ctx)
		}
	}
}
