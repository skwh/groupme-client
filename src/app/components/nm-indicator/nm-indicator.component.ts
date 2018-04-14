import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: 'app-nm-indicator',
  templateUrl: 'nm-indicator.component.html',
  styleUrls: ['nm-indicator.component.scss']
})
export class NmIndicatorComponent {
  @Input() visible: boolean;
  @Output() clicked = new EventEmitter<boolean>();

  constructor() {}
}