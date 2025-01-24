import { describe, expect, test } from 'vitest'
import { rollupBuild, testFixtures } from '../src'

test('rollupBuild', async () => {
  const { snapshot } = await rollupBuild('tests/fixtures/main.js')
  expect(snapshot).toMatchSnapshot()
})

describe('testFixtures', async () => {
  await testFixtures(
    'tests/fixtures/*.js',
    (args, id) => {
      if (id.endsWith('bar.js')) {
        expect(args).toEqual({
          'tests/fixtures/bar.js': undefined,
        })
      } else {
        expect(args).toEqual({
          'tests/fixtures/main.js': undefined,
        })
      }
      return 'ok'
    },
    { concurrent: true },
  )
})
