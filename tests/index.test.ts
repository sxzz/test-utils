import { describe, expect, test } from 'vitest'
import { normalizePath } from '@rollup/pluginutils'
import { rollupBuild, testFixtures } from '../src'

test('rollupBuild', async () => {
  const { snapshot } = await rollupBuild('tests/fixtures/main.js')
  expect(snapshot).toMatchSnapshot()
})

describe('testFixtures', async () => {
  await testFixtures('tests/fixtures/*.js', (args, id) => {
    expect(args).toEqual({
      'tests/fixtures/main.js': undefined,
    })
    expect(normalizePath(id)).contain('tests/fixtures/main.js')
    return 'ok'
  })
})
