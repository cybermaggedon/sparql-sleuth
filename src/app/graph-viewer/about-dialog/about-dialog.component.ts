import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'about-dialog',
  templateUrl: './about-dialog.component.html',
  styleUrls: ['./about-dialog.component.scss']
})
export class AboutDialogComponent implements OnInit {

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

