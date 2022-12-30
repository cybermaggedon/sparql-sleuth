
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { Properties } from '../../graph/properties.service';
import { Node, Relationship } from '../../graph/graph';

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

    @Input()
    relationships : Relationship[] = [];

    @Input()
    selection? : Node;

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

