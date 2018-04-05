import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { Message } from "../../models/message";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-messages-list',
  templateUrl: 'messages.component.html',
  styleUrls: ['messages.component.scss']
})
export class MessagesComponent implements OnInit {

  @Input() currentChannelNumber: number;
  @Input() currentUserId: number;
  @Output() getOldMessages = new EventEmitter<number>();

  @Input()
  set messages(messages: Array<Message>) {
    this._messages = [];
    this.addMessagesFromArray(messages);
  }

  messageSubject: Subject<Message[]> = new Subject();
  messages$: Observable<Message[]> = this.messageSubject.asObservable();
  private _messages: Message[] = [];

  reverseMessages: boolean = false;
  oldScrollHeight: number = 0;

  @ViewChild('messagesContainer') private messagesContainer: ElementRef;

  ngOnInit() {
    this.scrollToBottom();
  }

  ngAfterViewChecked() {
    if (this.oldScrollHeight != this.getScrollHeight()) {
      if (this.reverseMessages) {
        this.scrollToOldPosition();
        this.reverseMessages = false;
      } else {
        this.scrollToBottom();
      }
      this.oldScrollHeight = this.getScrollHeight();
    }
  }

  private addMessagesFromArray(messages: Message[]): void  {
    for (let message of messages) {
      this.addMessage(message);
    }
    this.oldScrollHeight = this.getScrollHeight();
  }

  private addMessage(message: Message): void {
    this._messages.push(message);
    this.messageSubject.next(this._messages);
  }

  private scrollToOldPosition(): void {
    /*
        When the new content is loaded, we want to measure its height and scroll down by that much.
        scrollHeight = total scrollable height of the element
        scrollTop = current scrolled amount
       */
    let newScrollHeight = this.getScrollHeight();
    let oldPosition = newScrollHeight - this.oldScrollHeight;
    this.scrollToLocation(oldPosition);
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch(error) {
      console.error(error);
    }
  }

  private scrollToLocation(location: number): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = location;
    } catch (error) {
      console.error(error);
    }
  }

  private getScrollHeight(): number {
    return this.messagesContainer.nativeElement.scrollHeight;
  }

  onScroll(ev: Event) {
    if (ev.srcElement.scrollTop === 0) {
      console.log("At the top!");
      this.getPreviousMessages();
    }
  }

  private getPreviousMessages(): void {
    let firstMessageId = this._messages[0].id;
    this.reverseMessages = true;
    this.getOldMessages.emit(firstMessageId);
  }
}