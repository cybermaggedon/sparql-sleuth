import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'dataset-dialog',
  templateUrl: './dataset-dialog.component.html',
  styleUrls: ['./dataset-dialog.component.scss']
})
export class DatasetDialogComponent implements OnInit {

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
