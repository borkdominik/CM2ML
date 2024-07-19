/// <reference types="vite/client" />
/// <reference types="vite-plugin-comlink/client" />
/// <reference types="vite-plugin-pwa/react" />
/// <reference types="vite-plugin-pwa/info" />
/// <reference lib="webworker" />

declare interface ExampleModel {
  name: string
  model: string
}

declare const __SOURCE_URL: string
declare const __EXAMPLE_MODELS: { language: string, models: ExampleModel[] }[]

declare module 'base64-compressor' {
  export async function encode<T>(input: T): Promise<string>
  export async function decode<T>(input: string): Promise<T>
}
