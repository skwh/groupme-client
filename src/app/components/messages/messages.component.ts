import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from "@angular/core";
import { Message } from "../../models/message";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import 'rxjs/add/operator/switchMap';
import { Subscription } from "rxjs/Subscription";

@Component({
  selector: 'app-messages-list',
  templateUrl: 'messages.component.html',
  styleUrls: ['messages.component.scss']
})
export class MessagesComponent implements OnInit, OnDestroy {

  @Input() currentChannelNumber: number;
  @Input() currentUserId: number;
  @Input() loadedAllMessages: boolean = false;
  @Output() getOldMessages = new EventEmitter<number>();

  @Input()
  set messages(messages: Array<Message>) {
    this._messages = [];
    this.addMessagesFromArray(messages);
  }

  messageSubject: Subject<Message[]> = new Subject();
  messages$: Observable<Message[]> = this.messageSubject.asObservable();
  messagesSubscription: Subscription;
  private _messages: Message[] = [];

  onloadScroll: boolean = false;
  reverseMessages: boolean = false;
  oldScrollHeight: number = 0;
  newMessageIndicatorVisible: boolean = false;

  @ViewChild('messagesContainer') private messagesContainer: ElementRef;

  ngOnInit() {
    this.messagesSubscription = this.messages$.subscribe(() => MessagesComponent.scrollToBottom());
  }

  ngOnDestroy() {
    this.messagesSubscription.unsubscribe();
    this.reverseMessages = false;
    this.oldScrollHeight = 0;
  }

  ngAfterViewInit() {
    MessagesComponent.scrollToBottom();
  }

  ngDoCheck() {
    if (this.reverseMessages) {
      this.scrollToOldPosition();
      this.reverseMessages = false;
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
    if (!this.reverseMessages) {
      this.newMessageIndicatorVisible = true;
    }
  }

  private scrollToOldPosition(): void {
    /*
        When the new content is loaded, we want to measure its height and scroll down by that much.
        scrollHeight = total scrollable height of the element
        scrollTop = current scrolled amount
       */
    console.log("Old Scroll height: " + this.oldScrollHeight);
    let newScrollHeight = this.getScrollHeight();
    console.log("New scroll height: " + newScrollHeight);
    let oldPosition = newScrollHeight - this.oldScrollHeight;
    console.log("old position: " + oldPosition);
    this.scrollToLocation(oldPosition);
  }

  private static scrollToBottom(): void {
    try {
      let lastMessage = document.querySelector('.lastMessage');
      if (lastMessage != null) {
        lastMessage.scrollIntoView({
         behavior: 'smooth'
        });
      }
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
    } else if (ev.srcElement.scrollTop === ev.srcElement.scrollHeight - 556) {
      console.log("At the bottom!");
      this.newMessageIndicatorVisible = false;
    } else {
      console.log(ev.srcElement.scrollHeight - ev.srcElement.scrollTop);
    }
  }

  newMessagesIndicatorClicked(): void {
    MessagesComponent.scrollToBottom();
    this.newMessageIndicatorVisible = false;
  }

  private getPreviousMessages(): void {
    let firstMessageId = this._messages[0].id;
    this.reverseMessages = true;
    if (!this.loadedAllMessages) {
      this.getOldMessages.emit(firstMessageId);
    }
  }
}