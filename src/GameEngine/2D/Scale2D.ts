/* eslint-disable no-underscore-dangle */
export default class Size2D {
	private _width: number
	private _height?: number

	public constructor(
		width: number,
		height?: number
	) {
		this._width = width
		this._height = height
	}

	public get width() {
		return this._width
	}

	public set width(v: number) {
		this._width = v
	}


	public get height() {
		return this._height ?? this._width
	}

	public set height(v: number) {
		this._height = v
	}
}
