import { nodeLib } from 'tsdown-preset-sxzz'

export default nodeLib(
  {},
  {
    deps: {
      neverBundle: ['ts-macro'],
    },
  },
)
