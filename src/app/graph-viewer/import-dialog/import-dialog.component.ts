import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { SerialisationService } from '../../graph/serialisation.service';

@Component({
    selector: 'import-dialog',
    templateUrl: './import-dialog.component.html',
    styleUrls: ['./import-dialog.component.scss']
})
export class ImportDialogComponent implements OnInit {

    @Input() display = false;

    @Output() onClose: EventEmitter<void> = new EventEmitter<void>();

    constructor(
	private ss : SerialisationService,
    ) { }
    
    ngOnInit(): void {
    }

    data : string = "";

    import() {
	this.ss.deserialise(this.data).subscribe(
	    (res : any) => {
		console.log(res);
	    }
	);
    }

    close() {
	this.onClose.emit();
    }

    onHide() {
	this.onClose.emit();
    }

}

