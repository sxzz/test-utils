import { outputToSnapshot } from './snapshot'
import type {
  InputOption,
  InputOptions,
  OutputOptions,
  RolldownOutput,
  RolldownPluginOption,
} from 'rolldown'

export async function rolldownBuild(
  input: InputOption,
  plugins: RolldownPluginOption = [],
  inputOptions: InputOptions = {},
  outputOptions: OutputOptions = {},
): Promise<{
  chunks: RolldownOutput['output']
  snapshot: string
}> {
  const { rolldown } = await import('rolldown')
  const bundle = await rolldown({
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
    checks: {
      pluginTimings: false,
      ...inputOptions.checks,
    },
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
