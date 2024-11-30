import process from 'node:process'
import { expect, test } from 'vitest'
import { outputToSnapshot } from '../src'

test('outputToSnapshot', () => {
  const result = outputToSnapshot([
    {
      type: 'chunk',
      fileName: 'chunk.js',
      code: `console.log("hello world ${process.cwd()}")`,
    } as any,
  ])
  expect(result).contain('[CWD]')
})
