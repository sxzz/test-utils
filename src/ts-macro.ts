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
