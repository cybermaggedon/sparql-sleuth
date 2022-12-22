
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { timer } from 'rxjs';

import { GraphService } from '../graph.service';
import { CommandService } from '../command.service';
import { PropertiesService, Properties } from '../properties.service';

enum BottomPaneMode {
    EMPTY,
    DETAIL,
    SEARCH
};

@Component({
    selector: 'graph-viewer',
    templateUrl: './graph-viewer.component.html',
    styleUrls: ['./graph-viewer.component.scss']
})
export class GraphViewerComponent implements OnInit {

    constructor(
	private graph : GraphService,
	private command : CommandService,
	private route : ActivatedRoute,
	private propertyService : PropertiesService,
    ) {

    }

    mode : BottomPaneMode = BottomPaneMode.EMPTY;

    get detailMode() : boolean { return this.mode == BottomPaneMode.DETAIL; }
    get searchMode() : boolean { return this.mode == BottomPaneMode.SEARCH; }

    properties : Properties = new Properties();

    ngOnInit() : void {

	this.command.beginSearchEvents().subscribe(
	    () => {
		this.mode = BottomPaneMode.SEARCH;
	    }
	);

	this.propertyService.propertiesEvents().subscribe(
	    ev => {
		this.properties = ev;
		this.mode = BottomPaneMode.DETAIL;
	    }
	);

	this.graph.nodeDeselectEvents().subscribe(
	    () => {
		this.mode = BottomPaneMode.EMPTY;
	    }
	);

    }

    ngAfterViewInit(): void {

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
			timer(1).subscribe(
			    () => {
				this.graph.recentre(id, expand);
			    }
			);
		    }

		} else {

		  // Do nothing if node not specified.

		}

	    }
	);

    }

}

