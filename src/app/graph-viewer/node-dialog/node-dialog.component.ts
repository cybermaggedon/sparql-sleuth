
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { Properties } from '../../graph/properties.service';

@Component({
    selector: 'node-dialog',
    templateUrl: './node-dialog.component.html',
    styleUrls: ['./node-dialog.component.scss']
})
export class NodeDialogComponent implements OnInit {

    @Input()
    display = false;

    @Input()
    properties : Properties = new Properties();

    constructor() { }
    
    ngOnInit(): void {
    }

    close() {
	this.onClose.emit();
    }

    @Output() onClose: EventEmitter<void> = new EventEmitter<void>();

    onHide() {
	this.onClose.emit();
    }

}

