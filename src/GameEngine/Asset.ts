import Vector2D from './2D/Vector2D'

// eslint-disable-next-line no-shadow
export enum AssetStatus {
	NOT_LOADED,
	LOADING,
	LOADED,
	ERROR
}

/**
 * Asset management Class
 */
export default class Asset {

	public static assets: Record<string, Asset> = {}

	public isLoaded = false
	public status: AssetStatus = AssetStatus.NOT_LOADED

	private image!: HTMLImageElement

	private constructor(
		private path: string
	) {}

	public static init(path: string) {
		if (!this.assets[path]) {
			this.assets[path] = new Asset(path)
		}
		return this.assets[path]
	}

	public async load() {
		if (this.status === AssetStatus.LOADED || this.status === AssetStatus.LOADING) {
			return
		}
		this.status = AssetStatus.LOADING
		return new Promise<void>((res, rej) => {
			this.image = new Image()
			this.image.src = this.path
			this.image.onload = () => {
				this.isLoaded = true
				this.status = AssetStatus.LOADED
				res()
			}
			this.image.onerror = () => {
				console.error('Error loading image')
				this.status = AssetStatus.ERROR
				rej()
			}
		})
	}

	public get() {
		if (this.status !== AssetStatus.LOADED) {
			throw new Error('Can\'t get an unloaded asset, please load it before')
		}
		return this.image
	}

	public size(): Vector2D {
		if (this.status !== AssetStatus.LOADED) {
			throw new Error('Can\'t get an unloaded asset, please load it before')
		}
		return new Vector2D(this.image.width, this.image.height)
	}
}
