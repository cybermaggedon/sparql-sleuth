
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { GraphService } from '../graph.service';

@Component({
    selector: 'graph-viewer',
    templateUrl: './graph-viewer.component.html',
    styleUrls: ['./graph-viewer.component.scss']
})
export class GraphViewerComponent implements OnInit {

    constructor(
	private graph : GraphService,
	private route : ActivatedRoute,
    ) {

    }

    ngOnInit(): void {

	this.route.queryParams.subscribe(

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

		} else {
//		    this.graph.schema();

		}

	    }
	);

    }

}

