
import { Component, OnInit } from '@angular/core';
import { debounceTime } from 'rxjs/operators';
import { timer } from 'rxjs';

import { ProgressService, ProgressEvent } from './progress.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
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
	    if (!(p in this.active)) {
		this.info.push(p + "...");
		this.active.add(p);
	    }
	}

	for(let a of this.active) {
	    if (!(a in progress.progress)) {
		this.info.push(a + "... done");
	    }
	}

	this.info = this.info.slice(-5);

	this.active = progress.progress;
	
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

