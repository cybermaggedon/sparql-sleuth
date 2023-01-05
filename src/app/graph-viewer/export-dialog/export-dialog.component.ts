
import { Component, OnInit, Input, Output, EventEmitter,
	 ViewChild, ElementRef } from '@angular/core';

import { SerialisationService } from '../../graph/serialisation.service';
import { CommandService, Command } from '../../command.service';

@Component({
    selector: 'export-dialog',
    templateUrl: './export-dialog.component.html',
    styleUrls: ['./export-dialog.component.scss']
})
export class ExportDialogComponent implements OnInit {

    @Input() display = false;

    @Output() onClose: EventEmitter<void> = new EventEmitter<void>();

    @ViewChild('text') textElt? : ElementRef;

    constructor(
        private ss : SerialisationService,
	private command : CommandService,
    ) { }
    
    ngOnInit(): void {

	this.command.command(Command.EXPORT).subscribe(
	    () => {
		this.export();
	    }
	);
    }

    data : string = "";

    export() {
	this.ss.serialise().subscribe(
	    (res : string) => {
		this.data = res;
	    }
	);
    }

    close() {
	this.onClose.emit();
    }

    onHide() {
	this.onClose.emit();
    }

    copy() {

	if (this.textElt) {

	    this.textElt.nativeElement.select();
	    document.execCommand('copy');

	}
    }

}

