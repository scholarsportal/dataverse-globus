import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.css']
})
export class UploadFileComponent implements OnInit {
  files: any = [];
  constructor() { }

  ngOnInit(): void {
  }
  uploadFile(event) {
    for (let index = 0; index < event.length; index++) {
      const element = event[index];
      this.files.push(element.name);
    }
  }
  deleteAttachment(index) {
    this.files.splice(index, 1);
  }



}
