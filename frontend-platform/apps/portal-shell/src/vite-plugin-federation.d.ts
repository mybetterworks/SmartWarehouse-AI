declare module 'virtual:__federation__' {
  export function __federation_method_setRemote(
    remoteName: string,
    remoteConfig: {
      url: string | (() => Promise<string>)
      format: 'esm' | 'systemjs' | 'var'
      from: 'vite' | 'webpack'
    }
  ): void

  export function __federation_method_getRemote(remoteName: string, exposedModule: string): Promise<unknown>

  export function __federation_method_unwrapDefault<T = unknown>(module: T): T
}
