import { genSnapshot } from './internal'
import type {
  InputOptions,
  InputPluginOption,
  OutputOptions,
  Plugin,
  RollupOutput,
} from 'rollup'

export async function rollupBuild(
  file: string,
  plugins: InputPluginOption = [],
  inputOptions: InputOptions = {},
  outputOptions: OutputOptions = {},
): Promise<{
  chunks: RollupOutput['output']
  snapshot: string
}> {
  const { rollup } = await import('rollup')
  const bundle = await rollup({
    input: [file],
    treeshake: false,
    onwarn(warning, defaultHandler) {
      if (
        ['UNUSED_EXTERNAL_IMPORT', 'UNRESOLVED_IMPORT'].includes(warning.code!)
      )
        return
      defaultHandler(warning)
    },
    ...inputOptions,
    plugins: [plugins, inputOptions.plugins],
  })
  const output = await bundle.generate({
    format: 'esm',
    sourcemap: false,
    ...outputOptions,
  })
  const chunks = output.output
  return {
    chunks,
    snapshot: genSnapshot(chunks),
  }
}

export const RollupToStringPlugin = (): Plugin => {
  return {
    name: 'to-string',
    transform: (code) => `export default \`${code.replaceAll('`', '\\`')}\``,
  }
}

export const RollupEscapeNullCharacterPlugin = (): Plugin => {
  return {
    name: 'escape-null-character',
    generateBundle(options, bundle) {
      for (const filename of Object.keys(bundle)) {
        const b = bundle[filename]
        if (b.type !== 'chunk') continue
        if (b.code.includes('\0')) {
          b.code = b.code.replaceAll('\0', '[NULL]')
        }
      }
    },
  }
}
