/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />
/// <reference types="vite-plugin-pwa/info" />
/// <reference lib="webworker" />

declare interface ExampleModel {
  name: string
  model: string
}

declare const __SOURCE_URL: string
declare const __EXAMPLE_MODELS: { language: string, models: ExampleModel[] }[]
