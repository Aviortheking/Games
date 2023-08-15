/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client-image" />
/// <reference path="./libs/ResponseBuilder" />

/**
 * Environment variables declaration
 */
interface ImportMetaEnv {
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}


declare namespace App {
	/**
	 * Middlewares variables
	 */
	interface Locals {
		responseBuilder: ResponseBuilder
	}
}
