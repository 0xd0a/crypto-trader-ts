const alphabet = "0123456789abcdef".split("");
export const genHexId = (size: number) =>
  new Array(size)
    .fill(0)
    .map(() => alphabet[Math.floor(Math.random() * 15)])
    .join("");

export const genHexId2 = (size: number) =>
  new Array(size)
    .fill(0)
    .map(() => Math.floor(Math.random() * 255).toString(16))
    .join("");
