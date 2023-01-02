import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'import-dialog',
    templateUrl: './import-dialog.component.html',
    styleUrls: ['./import-dialog.component.scss']
})
export class ImportDialogComponent implements OnInit {

    @Input() display = false;

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

