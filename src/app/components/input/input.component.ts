import { Component, ElementRef, EventEmitter, Output, ViewChild } from "@angular/core";

@Component({
  selector: 'app-input',
  templateUrl: 'input.component.html',
  styleUrls: ['input.component.scss']
})
export class InputComponent {
  @ViewChild('box') private messageInput: ElementRef;
  @Output() messageSent = new EventEmitter<string>();

  sendMessage(text: string) {
    this.messageInput.nativeElement.value = "";
    this.messageSent.emit(text);
  }
}