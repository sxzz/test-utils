import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { glob } from 'tinyglobby'
import type { OutputFile } from 'esbuild'
import type {
  OutputAsset as RolldownOutputAsset,
  OutputChunk as RolldownOutputChunk,
} from 'rolldown'
import type { OutputAsset, OutputChunk } from 'rollup'
import type { ExpectStatic } from 'vitest'

export function outputToSnapshot(
  chunks: (
    | OutputChunk
    | OutputAsset
    | RolldownOutputChunk
    | RolldownOutputAsset
    | OutputFile
  )[],
): string {
  const cwd = process.cwd()
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
      return `// ${filename.replaceAll('\\', '/')}\n${content.replaceAll(cwd, '[CWD]')}`
    })
    .sort()
    .join('\n')
}

export async function expectFilesSnapshot(
  sourceDir: string,
  snapshotFile: string,
  {
    pattern = '**/*',
    expect,
  }: { pattern?: string; expect?: ExpectStatic } = {},
): Promise<{
  files: string[]
  fileMap: any
  snapshot: string
}> {
  if (!expect) {
    expect = await import('vitest').then((m) => m.expect)
  }

  const cwd = process.cwd()
  const files = (await glob(pattern, { cwd: sourceDir })).sort()
  const fileMap = Object.fromEntries(
    await Promise.all(
      files.map(
        async (filename): Promise<[string, string]> => [
          filename.replaceAll('\\', '/'),
          (
            await readFile(path.resolve(sourceDir, filename), 'utf8')
          ).replaceAll(cwd, '[CWD]'),
        ],
      ),
    ),
  )
  const snapshot = Object.entries(fileMap)
    .map(([filename, contents]) => {
      const ext = path.extname(filename).slice(1)
      return `## ${filename}

\`\`\`${ext}
${contents}
\`\`\``
    })
    .join('\n')
  await expect!(snapshot).toMatchFileSnapshot(snapshotFile)

  return {
    files,
    fileMap,
    snapshot,
  }
}
