import { Pipe, PipeTransform } from "@angular/core"

@Pipe({ name: 'xor' })
export class XorPipe implements PipeTransform {
  transform(a: any[], b: any[], key: string): any[] {
    let xor = [];
    for (let i=0;i<a.length;i++) {
      if (!XorPipe.containsByKey(b, key, a[i])) {
        xor.push(a[i]);
      }
    }
    for (let i=0;i<b.length;i++) {
      if (!XorPipe.containsByKey(a, key, b[i])) {
        xor.push(b[i]);
      }
    }
    return xor;
  }
  private static containsByKey(array: any[], key: string, value: any): boolean {
    for (let i=0;i<array.length;i++) {
      if (array[i][key] === value) {
        return true;
      }
    }
    return false;
  }
}