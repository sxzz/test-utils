import { outputToSnapshot } from './snapshot'
import type { InputOptions, OutputOptions, RolldownOutput } from 'rolldown'

type InputPluginOption = NonNullable<InputOptions['plugins']>

export async function rolldownBuild(
  file: string,
  plugins: InputPluginOption = [],
  inputOptions: InputOptions = {},
  outputOptions: OutputOptions = {},
): Promise<{
  chunks: RolldownOutput['output']
  snapshot: string
}> {
  const { rolldown } = await import('rolldown')
  const bundle = await rolldown({
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
    snapshot: outputToSnapshot(chunks),
  }
}
