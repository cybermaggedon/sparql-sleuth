
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { SerialisationService } from '../../graph/serialisation.service';
import { CommandService, Command } from '../../command.service';

@Component({
    selector: 'gallery-dialog',
    templateUrl: './gallery-dialog.component.html',
    styleUrls: ['./gallery-dialog.component.scss']
})
export class GalleryDialogComponent implements OnInit {

    @Input() display = false;

    @Output() onClose: EventEmitter<void> = new EventEmitter<void>();

    constructor(
        private ss : SerialisationService,
	private command : CommandService,
    ) { }
    
    ngOnInit(): void {
    }

    data : string = "";

    close() {
	this.onClose.emit();
    }

    onHide() {
	this.onClose.emit();
    }

}

