import { Component, OnInit } from '@angular/core';
import { debounceTime } from 'rxjs/operators';

import { ProgressService, ProgressEvent } from '../progress.service';

@Component({
    selector: 'spinner',
    templateUrl: './spinner.component.html',
    styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements OnInit {

    working = false;

    constructor(
        private progress : ProgressService,
    ) { }

    ngOnInit(): void {
	this.progress.progressEvents().pipe(
	    debounceTime(10),
	).subscribe(
	    prog => {
		this.working = prog.working();
	    }
	);
    }

}
