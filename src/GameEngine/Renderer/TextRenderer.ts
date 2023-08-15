import Renderer from '.'
import type GameEngine from '..'

interface Params {
	text?: string
	size?: number
	weight?: 'bold'
	stroke?: string | {color: string, width: number}
	color?: string
	align?: 'left' | 'center' | 'right'
	overrideSizeLimit?: boolean
}

export default class TextRenderer extends Renderer<Params> {

	private width?: number

	public async getWidth() {
		return this.width ?? -1
	}

	// eslint-disable-next-line complexity
	public async render(ge: GameEngine, ctx: CanvasRenderingContext2D) {
		await super.render(ge, ctx)
		const globalScale = ge.currentScene?.scale ?? 1
		const item = this.preRender(ctx, ge)

		const size = this.component.scale.y * ge.caseSize.y

		if (typeof this.props.text !== 'string') {
			if (this.debug) {
				console.warn('no text, no display')
			}
			return
		}

		ctx.textBaseline = 'top'
		ctx.textAlign = this.props.align ?? 'left'
		let posX = item[0]
		if (this.props.align === 'center') {
			posX += item[2] / 2
		} else if (this.props.align === 'right') {
			posX += item[2]
		}
		ctx.font = `${this.props.weight ? `${this.props.weight} ` : ''}${(this.props.size ?? size) / 16 * ge.caseSize.x * globalScale * 3}px sans-serif`
		if (this.props.color) {
			ctx.fillStyle = this.props.color ?? 'black'
			ctx.fillText(this.props.text, posX, item[1], this.props.overrideSizeLimit ? undefined : item[2])
		}
		if (this.props.stroke) {
			if (typeof this.props.stroke === 'string') {
				ctx.strokeStyle = this.props.stroke
				ctx.lineWidth = ge.currentScene?.scale ?? 1
			} else {
				ctx.strokeStyle = this.props.stroke.color
				ctx.lineWidth = this.props.stroke.width * (ge.currentScene?.scale ?? 1)
			}
			ctx.strokeText(this.props.text, item[0], item[1], this.props.overrideSizeLimit ? undefined : item[2])
		}
		this.width = ctx.measureText(this.props.text).width / ge.caseSize.x / globalScale

		this.postRender(ctx, ge)
	}
}
