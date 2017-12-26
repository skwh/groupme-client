import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'truncate' })
export class TruncatePipe implements PipeTransform {
  transform(value: string, length: number) {
    if (value.length < length) {
      return value;
    }
    return value.slice(0,length) + "...";
  }

}