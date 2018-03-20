import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'reverse'
})
export class ReversePipe implements PipeTransform{
  transform(value: Array<any>): Array<any> {
    if (!value) {
      return;
    }
    return value.reverse();
  }

}