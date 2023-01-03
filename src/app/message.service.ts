import { Injectable } from '@angular/core';

import { MessageService as MService } from 'primeng/api';

@Injectable({
    providedIn: 'root',
})
export class MessageService {

    constructor(
	private messageService : MService,
    ) { }

    error(msg : any) {
	console.log("ERR:", msg.message.toString());
		this.messageService.add({
		    severity: "error",
		    summary: "ERROR",
		    detail: msg.message.toString(),
		    closable: true,
		});
    }

    announced = false;
    
    announce() {

	if (this.announced) return;

	this.announced = true;
    
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

}

