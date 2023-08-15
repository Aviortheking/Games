/* eslint-disable complexity */
/* eslint-disable max-len */
/* eslint-disable max-depth */
import { objectKeys, objectLoop } from '@dzeio/object-util'
import Renderer from '.'
import GameEngine from '..'

export interface StrokeOptions {
	color: string
	width: number
	dotted?: number
	position?: 'inside' | 'center' | 'outside'
	offset?: number
}

// type Border = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
// type Stroke = 'top' | 'bottom' | 'left' | 'right'

interface Params {
	material?: string | null
	alpha?: number
	stroke?: string | StrokeOptions | {
		top?: StrokeOptions
		right?: StrokeOptions
		bottom?: StrokeOptions
		left?: StrokeOptions
	}
	borderRadius?: number | {
		topLeft?: number
		topRight?: number
		bottomLeft?: number
		bottomRight?: number
	}
	debug?: boolean
}

export default class RectRenderer extends Renderer<Params> {

	private borderRadius: {
		topLeft: number
		topRight: number
		bottomLeft: number
		bottomRight: number
	} = {
			topLeft: 0,
			topRight: 0,
			bottomLeft: 0,
			bottomRight: 0
		}

	private stroke?: {
		top?: StrokeOptions
		right?: StrokeOptions
		bottom?: StrokeOptions
		left?: StrokeOptions
	}

	// eslint-disable-next-line complexity
	public async render(ge: GameEngine, ctx: CanvasRenderingContext2D) {
		await super.render(ge, ctx)
		const item = this.preRender(ctx, ge)
		const scaling = ge.currentScene?.scale ?? 1

		ctx.globalAlpha = this.props.alpha ?? 1

		if (this.props.material) {
			ctx.fillStyle = this.props.material
			// ctx.fillRect(...item)
			this.roundRect(ctx, ...item, true, false)
		}
		if (this.stroke && objectKeys(this.stroke).length > 0) {

			objectLoop(this.stroke, (options, strokePos) => {
				if (!options) {
					return
				}
				let offset = options.width * scaling / 2

				if (options.position === 'inside') {
					offset = -offset
				} else if (options.position === 'center') {
					offset = 0
				}

				ctx.lineWidth = options.width * scaling
				const lineByTwo = ctx.lineWidth / 3

				ctx.strokeStyle = options.color

				const xStart = item[0] - offset
				const xEnd = item[0] + item[2] + offset
				const yStart = item[1] - offset
				const yEnd = item[1] + item[3] + offset

				if (options.dotted) {
					ctx.setLineDash([options.dotted / 2 * scaling, options.dotted * scaling])
				}

				ctx.beginPath()
				switch (strokePos) {
					case 'top':
						ctx.moveTo(xStart - lineByTwo, yStart)
						ctx.lineTo(xEnd + lineByTwo, yStart)
						break
					case 'bottom':
						ctx.moveTo(xStart - lineByTwo, yEnd)
						ctx.lineTo(xEnd + lineByTwo, yEnd)
						break
					case 'left':
						ctx.moveTo(xStart, yStart - lineByTwo)
						ctx.lineTo(xStart, yEnd + lineByTwo)
						break
					case 'right':
						ctx.moveTo(xEnd, yStart - lineByTwo)
						ctx.lineTo(xEnd, yEnd + lineByTwo)
						break
				}
				ctx.stroke()

				ctx.setLineDash([])
			})

		}

		if (this.debug) {
			if (typeof this.stroke === 'string') {
				ctx.strokeStyle = this.stroke
			} else {
				ctx.strokeStyle = 'red'
				ctx.lineWidth = 1 * scaling
			}
			this.roundRect(ctx, ...item, false, true)
			// ctx.strokeRect(...item)
		}

		this.postRender(ctx, ge)
	}

	public onUpdate(): void {
		const ge = GameEngine.getGameEngine()
		const scaling = ge.currentScene?.scale ?? 1
		const min = Math.min(this.component.scale.x / 2, this.component.scale.y / 2)

		this.borderRadius = {
			topLeft: Math.min(typeof this.props.borderRadius === 'number' ? this.props.borderRadius : this.props.borderRadius?.topLeft ?? 0, min),
			topRight: Math.min(typeof this.props.borderRadius === 'number' ? this.props.borderRadius : this.props.borderRadius?.topRight ?? 0, min),
			bottomLeft: Math.min(typeof this.props.borderRadius === 'number' ? this.props.borderRadius : this.props.borderRadius?.bottomLeft ?? 0, min),
			bottomRight:Math.min(typeof this.props.borderRadius === 'number' ? this.props.borderRadius : this.props.borderRadius?.bottomRight ?? 0, min)
		}
		if (this.props.stroke) {
			if (typeof this.props.stroke === 'string') {
				const stroke = { color: this.props.stroke, width: 1 }
				this.stroke = {
					top: stroke,
					left: stroke,
					right: stroke,
					bottom: stroke
				}
			} else if ('color' in this.props.stroke) {
				this.stroke = {
					top: this.props.stroke,
					left: this.props.stroke,
					right: this.props.stroke,
					bottom: this.props.stroke
				}
			} else {
				this.stroke = this.props.stroke
			}
		} else {
			this.stroke = undefined
		}
	}

	/**
	 * Draws a rounded rectangle using the current state of the canvas.
	 * If you omit the last three params, it will draw a rectangle
	 * outline with a 5 pixel border radius
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {Number} x The top left x coordinate
	 * @param {Number} y The top left y coordinate
	 * @param {Number} width The width of the rectangle
	 * @param {Number} height The height of the rectangle
	 * @param {Number} [radius.tl = 0] Top left
	 * @param {Number} [radius.tr = 0] Top right
	 * @param {Number} [radius.br = 0] Bottom right
	 * @param {Number} [radius.bl = 0] Bottom left
	 * @param {Boolean} [fill = false] Whether to fill the rectangle.
	 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
	 */
	// eslint-disable-next-line complexity
	private roundRect(
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		width: number,
		height: number,
		fill = false,
		stroke = true
	) {
		ctx.beginPath()
		// topLeft point
		ctx.moveTo(x + this.borderRadius.topLeft, y)
		// line to top right
		ctx.lineTo(x + width - this.borderRadius.topRight, y)
		// curve for top right
		ctx.quadraticCurveTo(x + width, y, x + width, y + this.borderRadius.topRight)
		// line to bottom right
		ctx.lineTo(x + width, y + height - this.borderRadius.bottomRight)
		// curve for the bottom right
		ctx.quadraticCurveTo(x + width, y + height, x + width - this.borderRadius.bottomRight, y + height)
		// line to bottom left
		ctx.lineTo(x + this.borderRadius.bottomLeft, y + height)
		// curve for bottom left
		ctx.quadraticCurveTo(x, y + height, x, y + height - this.borderRadius.bottomLeft)
		// line to top left
		ctx.lineTo(x, y + this.borderRadius.topLeft)
		// curve for top left
		ctx.quadraticCurveTo(x, y, x + this.borderRadius.topLeft, y)
		// end path
		ctx.closePath()
		// fill rect
		if (fill) {
			ctx.fill()
		}
		// stroke rect
		if (stroke) {
			ctx.stroke()
		}
	}

	// private drawStroke(
	// 	ctx: CanvasRenderingContext2D,
	// 	ge: GameEngine,
	// 	width: number,
	// 	height: number,
	// 	stroke: Stroke,
	// 	options: StrokeOptions
	// ) {
	// 	const borders = this.getBorders(stroke)
	// 	const firstBorderRadius = this.getRadius(width, height, borders[0])
	// 	const secondBorderRadius = this.getRadius(width, height, borders[1])

	// 	ctx.lineWidth = ge.currentScene?.scale ?? 1

	// 	ctx.stroke()
	// }

	// private getStrokeSize(
	// 	width: number,
	// 	height: number,
	// 	stroke: Stroke
	// ): [[number, number], [number, number]] {
	// 	const borders = this.getBorders(stroke)
	// 	const firstBorderRadius = this.getRadius(width, height, borders[0])
	// 	const secondBorderRadius = this.getRadius(width, height, borders[1])

	// }

	// /**
	//  * get the borders for a specific stroke
	//  *
	//  * @param stroke the stroke to get border
	//  * @returns the name of the borders of the stroke
	//  */
	// private getBorders(stroke: Stroke): [Border, Border] {
	// 	switch (stroke) {
	// 		case 'top': return ['topLeft', 'topRight']
	// 		case 'bottom': return ['bottomLeft', 'bottomRight']
	// 		case 'left': return ['topLeft', 'bottomLeft']
	// 		case 'right': return ['topRight', 'bottomRight']
	// 	}
	// }

	// /**
	//  * get the border radius for a specific border
	//  *
	//  * @param width the width of the rectangle
	//  * @param height the height of the rectangle
	//  * @param border the border to find he radius
	//  * @returns the radius of the specified border
	//  */
	// private getRadius(width: number, height: number, border: Border): number {
	// 	if (!this.borderRadius) {
	// 		return 0
	// 	}
	// 	const min = Math.min(width / 2, height / 2)
	// 	if (typeof this.borderRadius === 'number') {
	// 		return Math.min(this.borderRadius, min)
	// 	}
	// 	return Math.min(this.borderRadius[border] ?? 0)
	// }
}
