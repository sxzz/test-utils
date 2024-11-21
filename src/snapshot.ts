import type { RolldownOutputAsset, RolldownOutputChunk } from 'rolldown'
import type { OutputAsset, OutputChunk } from 'rollup'

export function outputToSnapshot(
  chunks: (
    | OutputChunk
    | OutputAsset
    | RolldownOutputChunk
    | RolldownOutputAsset
  )[],
): string {
  return chunks
    .map((file) => {
      const filename = file.fileName.replaceAll('\\', '/')
      return file.type === 'chunk'
        ? `// ${filename}\n${file.code}`
        : typeof file.source === 'string'
          ? `// ${filename}\n${file.source}`
          : `// ${filename}\n[BINARY]`
    })
    .join('\n')
}
