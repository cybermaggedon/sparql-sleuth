
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { Row } from '../../query/query';

@Component({
    selector: 'schema-dialog',
    templateUrl: './schema-dialog.component.html',
    styleUrls: ['./schema-dialog.component.scss']
})
export class SchemaDialogComponent implements OnInit {

    @Input() display = false;

    @Input() schema : Row[] = [];

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

