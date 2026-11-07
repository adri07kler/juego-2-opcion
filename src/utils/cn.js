/**
 * Une clases condicionales evitando valores falsy.
 * @param {...(string | false | null | undefined | Array<string | false | null | undefined>)} classes
 * @returns {string}
 */
export function cn(...classes) {
  return classes.flat(Infinity).filter(Boolean).join(' ')
}
