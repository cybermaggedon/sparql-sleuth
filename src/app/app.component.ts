
import { Component, OnInit } from '@angular/core';
import { debounceTime } from 'rxjs/operators';
import { timer } from 'rxjs';
import { MessageService } from 'primeng/api';

import { ProgressService, ProgressEvent } from './progress.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

    working = false;

    info : string[] = [];

    active : Set<string> = new Set<string>();

    updateProgress(progress : ProgressEvent) {

	this.working = progress.working();

	if (!this.working) {
	    this.info = [];
	    return;
	}

	for(let p of progress.progress) {
	    if (!this.active.has(p)) {
		this.info.push(p + "...");
		this.active.add(p);
	    }
	}

	let dels = [];
	
	for(let a of this.active) {
	    if (!progress.progress.has(a)) {
		this.info.push(a + "... done");
		dels.push(a);
	    }
	}

	for(let del of dels)
	    this.active.delete(del);

	this.info = this.info.slice(-5);
	
    }

    constructor(
        private progress : ProgressService,
    ) {

    }

    ngOnInit() {
	this.progress.progressEvents().pipe(
	    // This skips a whole heap of events means some stuff won't be
	    // shown on the screen, but accuracy isn't important here, more
	    // the indication of activity.
//	    debounceTime(10),
	).subscribe(
	    prog => {
		
		timer(1).subscribe(
		    () => this.updateProgress(prog)
		);
	    }
	);
    }

}

