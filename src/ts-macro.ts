import { getLanguagePlugins } from '@ts-macro/language-plugin'
import { proxyCreateProgram } from '@volar/typescript'
import * as ts from 'typescript'
import type { Plugin } from 'ts-macro'

export function createTsMacroProgram(
  rootNames: string[],
  plugins: Plugin[],
  compilerOptions: ts.CompilerOptions = {},
): ts.Program {
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
