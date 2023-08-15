import { NotificationManager } from '@dzeio/components'
import Listener from '@dzeio/listener'

export interface ControllerConnectionEvent {
	controller: ControllerInterface
}

/**
 * Event containing a button state change
 */
export interface ControllerButtonEvent {
	/**
	 * The key as a text
	 *
	 * can be the keyboard/gamepad character
	 */
	key: string

	/**
	 * Warning: prefer the use of 'key'
	 */
	keyId: number

	/**
	 * Say if the button is pressed or not
	 */
	pressed: boolean

	/**
	 * Reference to the controller
	 */
	controller: ControllerInterface
}

export interface ControllerAxisEvent {

	/**
	 * axis id that changed
	 */
	axis: string

	/**
	 * axis new value as a value between 0 and 1
	 *
	 * @see Controller.setControllerDeadZone to setup the controller dead zone globally
	 */
	value: number

	/**
	 * Reference to the controller
	 */
	controller: ControllerInterface
}

export interface ControllerStates {
	/**
	 * timestamp of new the input changed value last time
	 */
	lastChange: number

	/**
	 * if the key being repeated
	 *
	 * mostly for internal usage
	 */
	repeat?: boolean

	/**
	 * the current value of the input
	 */
	value: number
}

interface GamepadControllerInterface {
	/**
	 * The Gamepad ID (mostly the name/brand with some unique identifier somewhere in the text)
	 */
	id: string

	/**
	 * the type of controller
	 *
	 * can be 'gamepad' | 'keyboard'
	 */
	type: 'gamepad'

	/**
	 * the Browser gamepad class
	 */
	gamepad: Gamepad

	/**
	 * the gamepad mapping
	 */
	mapping: GamepadMapping

	/**
	 * the input states
	 */
	states: Record<string | number, ControllerStates>
}

type ControllerInterface = {
	/**
	 * the type of controller
	 *
	 * can be 'gamepad' | 'keyboard'
	 */
	type: 'keyboard'

	/**
	 * The Gamepad ID (mostly the name/brand with some unique identifier somewhere in the text)
	 */
	id: 'keyboard'
} | GamepadControllerInterface

/**
 * Gamepad mapping of IDs into human readable keys
 */
type GamepadMapping = Array<string | null>

/**
 * Nintendo Switch specific controls
 */
const SwitchMapping: GamepadMapping = [
	'b',
	'a',
	'x',
	'y',
	'screen',
	'l',
	'r',
	'zl',
	'zr',
	'select',
	'start',
	'home',
	'leftthumb',
	'rightthumb'
]

/**
 * Xbox specific controls
 */
const XboxMapping: GamepadMapping = [
	'a',
	'b',
	null,
	'x',
	'y',
	null,
	'lb',
	'rb',
	null,
	null,
	null,
	'start',
	null,
	'leftthumb',
	'rightthumb'
]

/**
 * Default mapping made as a base
 *
 * to add a new mapping use this url
 * https://luser.github.io/gamepadtest/
 */
const DefaultMapping: GamepadMapping = [
	'a',
	'b',
	'y',
	'x',
	'l',
	'r',
	'zl',
	'zr',
	'select',
	'start'
]

/**
 * This class allows you to get the controller states and update
 * your application using the different Controllers like a keyboard or a Gamepad
 *
 * Please use `Controller.destroy()` at the end of your
 * usage to finish the event listeners setup by the class
 */
export default class Controller extends Listener<{
	/**
	 * event sent when a new connection is established
	 */
	connected: (ev: ControllerConnectionEvent) => void

	/**
	 * event sent when a connection is broken
	 */
	disconnected: (ev: ControllerConnectionEvent) => void

	/**
	 * event sent when the key is down
	 */
	keyDown: (ev: ControllerButtonEvent) => void

	/**
	 * event sent once the key is up
	 */
	keyUp: (ev: ControllerButtonEvent) => void

	/**
	 * Event sent when a key is pressed
	 */
	keyPress: (ev: ControllerButtonEvent) => void

	/**
	 * Event sent when an axe is moving
	 *
	 * Event is sent continiously until it goes back to 0
	 *
	 * @see Controller.setControllerDeadZone to setup the controller dead zone globally
	 */
	axisMove: (ev: ControllerAxisEvent) => void
	all: (eventName: string, ...args: Array<any>) => void
}> {

	/**
	 * List of external gamepads
	 */
	private gamepads: Array<ControllerInterface> = []

	/**
	 * Gamepad key/axes loop
	 */
	private doLoop = false

	/**
	 * Controller axes dead zone
	 */
	private controllerDeadZone = 0.5

	public constructor() {
		super()

		// Add the gamepad event listeners
		window.addEventListener('gamepadconnected', this.onGamepadConnect)
		window.addEventListener('gamepaddisconnected', this.onGamepadDisconnect)

		// add the keyboard event listeners
		document.addEventListener('keydown', this.keyboardKeyDownEvent)
		document.addEventListener('keyup', this.keyboardKeyPressEvent)
		document.addEventListener('keypress', this.keyboardKeyUpEvent)
	}

	/**
	 * set the controller (Gamepads only) axis dead zone
	 * @param value value between 0 and 1
	 */
	public setControllerDeadZone(value: number) {
		if (value < 0 || value >= 1) {
			throw new Error(`Controller Dead Zone Out of bound (must respect 0 < value (${value}) < 1)`)
		}
		this.controllerDeadZone = value
	}

	/**
	 * terminate the class
	 */
	public destroy() {
		this.doLoop = false
		this.gamepads = []
		window.removeEventListener('gamepadconnected', this.onGamepadConnect)
		window.removeEventListener('gamepaddisconnected', this.onGamepadDisconnect)
		document.removeEventListener('keydown', this.keyboardKeyDownEvent)
		document.removeEventListener('keyup', this.keyboardKeyPressEvent)
		document.removeEventListener('keypress', this.keyboardKeyUpEvent)
	}

	/**
	 * Browser keyboard event handler
	 */
	private keyboardKeyDownEvent = (ev: KeyboardEvent) => {
		this.emit('keyDown', {
			key: ev.key,
			keyId: ev.keyCode,
			pressed: true,
			controller: {
				type: 'keyboard',
				id: 'keyboard'
			}
		})
	}

	/**
	 * Browser keyboard event handler
	 */
	private keyboardKeyPressEvent = (ev: KeyboardEvent) => {
		this.emit('keyPress', {
			key: ev.key,
			keyId: ev.keyCode,
			pressed: true,
			controller: {
				type: 'keyboard',
				id: 'keyboard'
			}
		})
	}

	/**
	 * Browser keyboard event handler
	 */
	private keyboardKeyUpEvent = (ev: KeyboardEvent) => {
		this.emit('keyUp', {
			key: ev.key,
			keyId: ev.keyCode,
			pressed: false,
			controller: {
				type: 'keyboard',
				id: 'keyboard'
			}
		})
	}

	/**
	 * Handle gamepad disconnection
	 */
	private onGamepadDisconnect = (ev: GamepadEvent) => {
		const index = this.gamepads.findIndex((it) => it.id === ev.gamepad.id)
		if (index < 0) {
			return
		}
		const gamepad = this.gamepads.splice(index, 1)[0]
		console.log('Controller disconnected', gamepad.id)
		if (this.gamepads.length === 0) {
			this.doLoop = false
		}
		this.emit('disconnected', {
			controller: gamepad
		})
	}

	/**
	 * Handle gamepad connection
	 */
	private onGamepadConnect = (ev: GamepadEvent) => {
		const gp = ev.gamepad

		if (!gp) {
			NotificationManager.addNotification('Gamepad connected but not usable by device')
			return
		}

		// create it's interface
		const gamepad: ControllerInterface = {
			type: 'gamepad',
			id: gp.id,
			gamepad: gp,
			mapping: gp.id.includes('Switch') ? SwitchMapping : gp.id.includes('Xbox') ? XboxMapping : DefaultMapping,
			states: {}
		}

		// add buttons to states
		for (let idx = 0; idx < gp.buttons.length; idx++) {
			const button = gp.buttons[idx]
			gamepad.states['button-' + idx] = {
				lastChange: new Date().getTime(),
				value: button.pressed ? 1 : 0
			}
		}

		// add axis to states
		for (let idx = 0; idx < gp.axes.length; idx++) {
			const axe = gp.axes[idx]
			gamepad.states['axe-' + idx] = {
				lastChange: new Date().getTime(),
				value: axe
			}
		}

		console.log('New Controller connected', gamepad.id)

		// add it to the global gamepads list
		this.gamepads.push(gamepad)

		this.emit('connected', {
			controller: gamepad
		})

		// start gamepads polling for new states
		if (!this.doLoop) {
			this.doLoop = true
			this.update()
		}
	}

	/**
	 * Polling to check if the gamepad has changes with it's buttons or not
	 */
	private update() {
		const now = new Date().getTime()

		// loop through every gamepads
		for (let gIdx = 0; gIdx < this.gamepads.length; gIdx++) {
			const gamepad = this.gamepads[gIdx]
			if (gamepad.type !== 'gamepad') {
				continue
			}

			// Chromium specific as gamepad.gamepad is not updated
			gamepad.gamepad = navigator.getGamepads()[gIdx] ?? gamepad.gamepad

			// loop through each buttons
			for (let idx = 0; idx < gamepad.gamepad.buttons.length; idx++) {
				const button = gamepad.gamepad.buttons[idx]
				const gs = gamepad.states['button-' + idx]
				const repeatedPress = gs.repeat || gs.lastChange + 300 < now
				// handle state change or press repetition
				if (button.pressed !== !!gs.value || button.pressed && repeatedPress) {
					if (button.pressed && gs.value && repeatedPress) {
						gs.repeat = true
					} else if (!button.pressed) {
						gs.repeat = false
					}

					// send keypress event once
					if (button.pressed && !gs.value) {
						this.emit('keyPress', {
							key: gamepad.mapping[idx] ?? idx.toString(),
							keyId: idx,
							pressed: button.pressed,
							controller: gamepad
						})
					}

					// send keydown/keyup event
					gs.lastChange = now
					gamepad.states['button-' + idx].value = button.pressed ? 1 : 0
					this.emit(button.pressed ? 'keyDown' : 'keyUp', {
						key: gamepad.mapping[idx] ?? idx.toString(),
						keyId: idx,
						pressed: button.pressed,
						controller: gamepad
					})
				}
			}

			// loop through each axises
			for (let idx = 0; idx < gamepad.gamepad.axes.length; idx++) {
				let axe = gamepad.gamepad.axes[idx]
				if (Math.abs(axe) < this.controllerDeadZone) {
					axe = 0
				}

				// emit event when value is not a 0
				if (axe !== gamepad.states['axe-' + idx].value || axe !== 0) {
					gamepad.states['axe-' + idx].value = axe
					this.emit('axisMove', {
						axis: idx.toString(),
						value: axe,
						controller: gamepad
					})
				}
			}
		}

		// ask for new loop when available
		if (this.doLoop) {
			requestAnimationFrame(() => this.update())
		}
	}
}
