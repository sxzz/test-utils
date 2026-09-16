import { outputToSnapshot } from './snapshot'
import type {
  InputOption,
  InputOptions,
  InputPluginOption,
  OutputOptions,
  Plugin,
  RollupOutput,
} from 'rollup'

export async function rollupBuild(
  input: InputOption,
  plugins: InputPluginOption = [],
  inputOptions: InputOptions = {},
  outputOptions: OutputOptions = {},
): Promise<{
  chunks: RollupOutput['output']
  snapshot: string
}> {
  const { rollup } = await import('rollup')
  const bundle = await rollup({
    input,
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
    snapshot: outputToSnapshot(chunks),
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
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk') continue
        if (chunk.code.includes('\0')) {
          chunk.code = chunk.code.replaceAll('\0', '[NULL]')
        }
      }
    },
  }
}
