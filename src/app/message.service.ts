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
}
