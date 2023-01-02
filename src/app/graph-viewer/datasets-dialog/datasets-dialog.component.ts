import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'datasets-dialog',
  templateUrl: './datasets-dialog.component.html',
  styleUrls: ['./datasets-dialog.component.scss']
})
export class DatasetsDialogComponent implements OnInit {

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
