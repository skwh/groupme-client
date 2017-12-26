import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'initials' })
export class InitialsPipe implements PipeTransform {
  transform(value: string): string {
    let initials = "";
    let words = value.split(" ");
    for (let i=0;i<words.length;i++) {
      initials += words[i].charAt(0);
      if (i == 1) {
        break;
      }
    }
    return initials.toUpperCase();
  }

}