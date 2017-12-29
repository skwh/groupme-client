import { Component, EventEmitter, Output } from "@angular/core";

@Component({
  selector: 'app-attach',
  templateUrl: 'attach.component.html',
  styleUrls: ['attach.component.scss']
})
export class AttachComponent {
  @Output('done') done = new EventEmitter<string>();
  @Output('cancel') cancel = new EventEmitter<boolean>();

  uploadedImageUrl: string = "";
  imageUploaded: boolean = false;

  handleUpload(event): void {
    this.uploadedImageUrl = event;
    this.imageUploaded = true;
  }
}