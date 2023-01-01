
import { Component, OnInit } from '@angular/core';
import { debounceTime } from 'rxjs/operators';

import { ProgressService } from './progress.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    working = false;

    info : string[] = [];

    constructor(
        private progress : ProgressService,
    ) {
	this.progress.progressEvents().pipe(
	    // This skips a whole heap of events means some stuff won't be
	    // shown on the screen, but accuracy isn't important here, more
	    // the indication of activity.
	    debounceTime(10),
	).subscribe(
	    p => {

		this.working = p.working();

		this.info = Array.from(p.progress.values()).slice(0, 4).map(
		    x => x + "..."
		);

	    }
	);
    }

    ngOnInit() {
    }

}

