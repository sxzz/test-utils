import type { OutputFile } from 'esbuild'
import type { RolldownOutputAsset, RolldownOutputChunk } from 'rolldown'
import type { OutputAsset, OutputChunk } from 'rollup'

export function outputToSnapshot(
  chunks: (
    | OutputChunk
    | OutputAsset
    | RolldownOutputChunk
    | RolldownOutputAsset
    | OutputFile
  )[],
): string {
  return chunks
    .map((file) => {
      let filename: string, content: string
      if ('path' in file) {
        filename = file.path
        content = file.text
      } else {
        filename = file.fileName
        content =
          file.type === 'chunk'
            ? file.code
            : typeof file.source === 'string'
              ? file.source
              : '[BINARY]'
      }
      return `// ${filename.replaceAll('\\', '/')}\n${content}`
    })
    .sort()
    .join('\n')
}
