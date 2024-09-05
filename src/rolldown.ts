import {
  rolldown,
  type InputOptions,
  type OutputOptions,
  type RolldownOutput,
} from 'rolldown'

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
    plugins: [...plugins, ...(inputOptions.plugins || [])],
  })
  const output = await bundle.generate({
    format: 'esm',
    sourcemap: false,
    ...outputOptions,
  })
  const chunks = output.output
  return {
    chunks,
    snapshot: chunks
      .map((file) =>
        file.type === 'chunk'
          ? `// ${file.fileName}\n${file.code}`
          : typeof file.source === 'string'
            ? `// ${file.fileName}\n${file.source}`
            : `// ${file.fileName}\n[BINARY]`,
      )
      .join('\n'),
  }
}
