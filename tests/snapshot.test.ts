import path from 'node:path'
import process from 'node:process'
import { expect, test } from 'vitest'
import { expectFilesSnapshot, outputToSnapshot } from '../src'

test.concurrent('outputToSnapshot', () => {
  const result = outputToSnapshot([
    {
      type: 'chunk',
      fileName: 'chunk.js',
      code: `console.log("hello world ${process.cwd()}")`,
    } as any,
  ])
  expect(result).contain('[CWD]')
})

test.concurrent('expectFilesSnapshot', async ({ expect }) => {
  await expectFilesSnapshot(
    path.resolve(__dirname, 'fixtures'),
    path.resolve(__dirname, '__snapshots__/expectFilesSnapshot.md'),
    { expect },
  )
})
