
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { GraphService } from './graph.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    constructor(
	private route : ActivatedRoute,
	private graph : GraphService,
    ) {
	route.queryParams.subscribe(
	    params => {

		if (params["node"]) {

		    // Perhaps recentre should be a different event.

		    const id = params["node"];

		    let expand = "no";
		    
		    if (params["expand"]) {
			expand = params["expand"];
		    }

		    if (id) {
			this.graph.recentre(id, expand);
		    }

		}

	    }
	);
    }

}

