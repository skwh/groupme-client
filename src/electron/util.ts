export function copy(o) {
  let output, v, key;
  output = Array.isArray(o) ? [] : {};
  for (key in o) {
    v = o[key];
    output[key] = (typeof v === "object") ? copy(v) : v;
  }
  return output;
}

export class FixedSizeArray<T>  {
  private array: Array<T> = [];
  constructor(private size: number) {}

  push(item: T): void {
    this.array.push(item);
    if (this.array.length > this.size) {
      this.array = this.array.slice(this.array.length - this.size);
    }
  }

  unshift(item: T): void {
    this.array.unshift(item);
    if (this.array.length > this.size) {
      this.array = this.array.slice(0, this.size);
    }
  }

  get(index: number): T {
    return this.array[index];
  }

  indexOf(item: T): number {
    return this.array.indexOf(item);
  }

  toString(): string {
    let string = "[";
    for (let item of this.array) {
      string += item.toString() + ",";
    }
    string += "], max size: " + this.size;
    return string;
  }
}