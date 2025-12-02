import process from 'node:process'
import type { RawVueCompilerOptions } from '@vue/language-core'
import type { Plugin } from 'ts-macro'
import type { CompilerOptions, Program } from 'typescript'

export async function createTsMacroProgram(
  rootNames: string[],
  plugins: Plugin[],
  compilerOptions: CompilerOptions = {},
): Promise<Program> {
  const ts = await import('typescript')
  const { getLanguagePlugins } = await import('@ts-macro/language-plugin')
  const { proxyCreateProgram } = await import('@volar/typescript')

  const host = ts.createCompilerHost(compilerOptions)
  const createProgram = proxyCreateProgram(
    ts,
    ts.createProgram,
    (ts, options) => getLanguagePlugins(ts, options.options, { plugins }),
  )

  const program = createProgram({
    options: compilerOptions,
    host,
    rootNames,
  })
  return program
}

export async function createVueProgram(
  rootNames: string[],
  compilerOptions: CompilerOptions = {},
  vueCompilerOptions: RawVueCompilerOptions = {},
): Promise<Program> {
  const ts = await import('typescript')
  const { createVueLanguagePlugin, CompilerOptionsResolver } =
    await import('@vue/language-core')
  const { proxyCreateProgram } = await import('@volar/typescript')

  const host = ts.createCompilerHost(compilerOptions)
  const createProgram = proxyCreateProgram(
    ts,
    ts.createProgram,
    (ts, options) => {
      const rootDir = (options.options.$rootDir as string) || process.cwd()
      const resolver = new CompilerOptionsResolver(ts.sys.fileExists)
      resolver.addConfig(vueCompilerOptions, rootDir)
      const vueOptions = resolver.build()

      const vuePlugin = createVueLanguagePlugin<string>(
        ts,
        options.options,
        vueOptions,
        (id) => id,
      )
      return { languagePlugins: [vuePlugin] }
    },
  )

  const program = createProgram({
    options: compilerOptions,
    host,
    rootNames,
  })
  return program
}
