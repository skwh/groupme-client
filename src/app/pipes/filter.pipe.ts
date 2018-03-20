import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'filter' })
export class FilterPipe implements PipeTransform {
  transform(value: any[], property: string, filter: string): any[] {
    return value.filter(item => {
      if (item.hasOwnProperty(property))
        return item[property].indexOf(filter) > -1;
      return false;
    });
  }
}