
import { Component, OnInit } from '@angular/core';
import { timer } from 'rxjs';

//import { MessageService } from 'primeng/api';

import { CommandService } from '../command.service';

@Component({
    selector: 'toast',
    templateUrl: './toast.component.html',
    styleUrls: ['./toast.component.scss'],
})
export class ToastComponent implements OnInit {

    constructor(
	private command : CommandService,
//	private messageService : MessageService,
    ) { }

    ngOnInit(): void {
/*

	timer(1).subscribe(
	    ()=> {
		this.messageService.add({
		    severity: "info",
		    summary: "Getting started",
		    detail: "Welcome to SPARQL Explorer!\n\n" +
			"Click here to see the the Getting Started " +
			"guide, also available on the menu",
		    key: "announce",
		    life: 5000,
		    closable: true,
		});
	    }
	);

*/
    }

    info() {
	this.command.info();
    }

}
