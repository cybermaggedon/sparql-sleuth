
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

    constructor(
        private progress : ProgressService,
    ) {
	this.progress.progressEvents().pipe(
	    debounceTime(10),
	).subscribe(
	    p => {
		this.working = p.working();
	    }
	);
    }

    ngOnInit() {
    }

}

