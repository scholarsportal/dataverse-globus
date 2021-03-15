import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-select-directory',
  templateUrl: './select-directory.component.html',
  styleUrls: ['./select-directory.component.css']
})
export class SelectDirectoryComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }
  dir: Array<object>;

  ngOnInit(): void {
    console.log(this.data);
    this.dir = new Array<object>();
    for (const obj of this.data) {
      if (obj.children.length > 0) {
        this.dir.push(obj);
      }
    }
  }

  submit() {

  }

}
