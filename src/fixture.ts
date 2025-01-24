import path from 'node:path'
import process from 'node:process'
import { normalizePath } from '@rollup/pluginutils'
import { glob, type GlobOptions } from 'tinyglobby'
import { describe, test } from 'vitest'

type SkipFn = (testName: string) => boolean | Promise<boolean>
let isSkip: SkipFn | undefined
export function testFixturesSkip(fn: SkipFn): void {
  isSkip = fn
}

export interface FixtureOptions {
  params?: [name: string, values?: any[]][]
  promise?: boolean
  concurrent?: boolean
}

export async function testFixtures(
  globs: string | string[],
  exec: (args: Record<string, any>, id: string) => any,
  options?: GlobOptions & FixtureOptions,
): Promise<void>
export async function testFixtures(
  files: Record<string, string>,
  exec: (args: Record<string, any>, id: string, code: string) => any,
  options?: FixtureOptions,
): Promise<void>
export async function testFixtures(
  globsOrFiles: string | string[] | Record<string, string>,
  cb: (args: Record<string, any>, id: string, code: string) => any,
  {
    params,
    promise,
    concurrent,
    ...globOptions
  }: GlobOptions & FixtureOptions = {},
) {
  let files: Record<string, string | undefined>

  if (typeof globsOrFiles === 'string' || Array.isArray(globsOrFiles)) {
    files = Object.fromEntries(
      (await glob(globsOrFiles, globOptions)).map((file) => [file, undefined]),
    )
  } else {
    files = globsOrFiles
  }

  for (const [id, code] of Object.entries(files)) {
    makeTests(id, code, [[normalizePath(id)], ...(params || [])])()
  }

  function makeTests(
    id: string,
    code: string | undefined,
    params: NonNullable<FixtureOptions['params']>,
    args: Record<string, any> = {},
  ) {
    const [currParams, ...restParams] = params
    const [name, values = [undefined]] = currParams
    if (restParams.length > 0) {
      return () => {
        for (const value of values) {
          const currArgs = { ...args, [name]: value }

          describe(
            getName(name, value),
            makeTests(id, code, restParams, currArgs),
          )
        }
      }
    } else {
      return () => {
        for (const value of values) {
          const testName = getName(name, value)
          let testFn = test.skipIf(isSkip?.(testName))
          if (concurrent) {
            testFn = testFn.concurrent
          }
          testFn(testName, async ({ expect }) => {
            const currArgs = { ...args, [name]: value }
            const execute = () =>
              cb(
                currArgs,
                path.resolve(globOptions.cwd || process.cwd(), id),
                code!,
              )
            if (id.includes('error')) {
              if (promise) {
                await expect(execute()).rejects.toThrowErrorMatchingSnapshot()
              } else {
                expect(execute).toThrowErrorMatchingSnapshot()
              }
            } else if (promise) {
              await expect(
                (execute() as Promise<any>).catch((error) => {
                  console.warn(error)
                  return Promise.reject(error)
                }),
              ).resolves.toMatchSnapshot()
            } else {
              expect(execute()).toMatchSnapshot()
            }
          })
        }
      }
    }
  }
}

function getName(name: string, value: any) {
  return value !== undefined ? `${name} = ${String(value)}` : name
}
