
import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

import { Row } from '../../query/query';

@Component({
  selector: 'datasets-dialog',
  templateUrl: './datasets-dialog.component.html',
  styleUrls: ['./datasets-dialog.component.scss']
})
export class DatasetsDialogComponent implements OnInit {

    @Input() display = false;

    @Input() datasets : Row[] = [];

    @Output() onClose: EventEmitter<void> = new EventEmitter<void>();

    constructor() { }

    ngOnInit(): void {
    }

    close() {
	this.onClose.emit();
    }

    onHide() {
	this.onClose.emit();
    }

}
