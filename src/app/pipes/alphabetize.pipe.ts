import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'alphabetize' })
export class AlphabetizePipe implements PipeTransform {
  transform(value: any[], key: string): any[] {
    return value.sort((a: any, b: any) => {
      if (a.hasOwnProperty(key) && b.hasOwnProperty(key)) {
        if (a[key].toLowerCase() > b[key].toLowerCase()) {
          return 1;
        } else {
          return -1;
        }
      }
      return 0;
    })
  }

}