import {Component, Input} from '@angular/core';
import {EndpointTemplateComponent} from '../endpoint-template/endpoint-template.component';
import {NavigateTemplateComponent} from '../navigate-template/navigate-template.component';
import {NgIf} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {TransferData} from '../upload/upload.component';

@Component({
  selector: 'app-referenced',
  standalone: true,
    imports: [
        EndpointTemplateComponent,
        NavigateTemplateComponent,
        NgIf,
        TranslateModule
    ],
  templateUrl: './referenced.component.html',
  styleUrl: './referenced.component.css'
})
export class ReferencedComponent {
    @Input() dataTransfer: TransferData;
    @Input() type: number; // 0 - left, 1 - right, 2 - center
    load: boolean;
    selectedEndPoint: any;
    referencedEndpoints: Array<object>;

    setSelectedEndpoint($event: any) {
        this.selectedEndPoint = $event;
    }

    ifLoaded($event: any) {
        this.referencedEndpoints = $event;
        this.load = true;
    }

    referencedExist() {
        return typeof this.referencedEndpoints !== 'undefined' && this.referencedEndpoints.length > 0;
    }
}
