import { sum } from './index'

///////////////////////////////////////////////////////////////////////////
//
// Gotcha: https://vitest.dev/guide/common-errors#cannot-find-module-relative-path
// You can't actually use relative path aliases in the test files.
// However, if the file your testing using relative path aliases, then that
// will still work. For example, I did this and it still worked:
//
//   import { log } from 'utils/log'
//   import { add } from 'utils/add'
//
//   export const sum = (...numbers: number[]): number => {
//     log()
//     return add(...numbers)
//   }
//
///////////////////////////////////////////////////////////////////////////

import { describe, it, expect, test } from 'vitest'

describe('The sum() function...', () => {
  test('should return 0 with no numbers', () => {
    const value = sum()
    expect(value).toBe(0)
  })

  it('should return same number when only one arg', () => {
    const value = sum(5)
    // ❌ Intentionally wrong to test .github/workflows/ci.yml on pull_request.
    expect(value).toBe(4) //! Temporary
  })

  test('should return correct sum with multiple args', () => {
    const value = sum(1, 2, 3)
    expect(value).toBe(6)
  })
})
