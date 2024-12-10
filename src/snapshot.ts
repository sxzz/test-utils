import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { glob } from 'tinyglobby'
import { expect } from 'vitest'
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
      const cwd = process.cwd()
      return `// ${filename.replaceAll('\\', '/')}\n${content.replaceAll(cwd, '[CWD]')}`
    })
    .sort()
    .join('\n')
}

export async function expectFilesSnapshot(
  sourceDir: string,
  snapshotFile: string,
  pattern: string = '**/*',
): Promise<void> {
  const outputFiles = await glob(pattern, { cwd: sourceDir })
  const snapshot = (
    await Promise.all(
      outputFiles.map(async (filename) => {
        const ext = path.extname(filename).slice(1)
        return `## ${filename.replaceAll('\\', '/')}

\`\`\`${ext}
${await readFile(path.resolve(sourceDir, filename), 'utf8')}
\`\`\``
      }),
    )
  ).join('\n')
  await expect(snapshot).toMatchFileSnapshot(snapshotFile)
}
