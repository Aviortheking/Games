/**
 * Asset management Class
 */
export default class Asset {

	public static assets: Record<string, Asset> = {}

	public isLoaded = false

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
		return new Promise<void>((res, rej) => {
			this.image = new Image()
			this.image.src = this.path
			this.image.onload = () => {
				this.isLoaded = true
				res()
			}
			this.image.onerror = rej
		})
	}

	public async get() {
		if (!this.isLoaded) {
			await this.load()
		}
		return this.image
	}
}
