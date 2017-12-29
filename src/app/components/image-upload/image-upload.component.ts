import { Component, ElementRef, EventEmitter, Output, ViewChild } from "@angular/core";
import { StateService } from "../../providers/state.service";

@Component({
  selector: 'app-image-upload',
  templateUrl: 'image-upload.component.html',
  styleUrls: ['image-upload.component.scss']
})
export class ImageUploadComponent {
  constructor(private state: StateService) {}

  @ViewChild('dragAndDropBox') private dropbox: ElementRef;
  @Output() onUploaded = new EventEmitter<string>();

  handleFileUpload(event): void {
    let firstFile = event.target.files.item(0);
    this.state.handleImageUpload(firstFile).then(response => {
      this.onUploaded.emit(response);
    });
  }
}