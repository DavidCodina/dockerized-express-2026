// https://bobbyhadz.com/blog/typescript-make-types-global
// Note also that typescript-eslint recommends NOT using no-undef.
// https://typescript-eslint.io/linting/troubleshooting/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors

// The declare keyword in TypeScript is used to tell the compiler that the variable, class,
//function, or module is already defined elsewhere. When we use declare namespace Express,
// we're not overwriting the existing Express types, but rather adding to them.
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number
        roles: string[]
        iat: number
        exp: number
        sessionExp: number
      }
    }
  }
}

export {}
