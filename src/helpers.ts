
export function clean(value: string) {
  return value.replace(/[^0-9,a-z,A-Z$_]+/g, "");
}

// export function compileWheres(where)

export default {
  clean
}