
import { Component, OnInit } from '@angular/core';

import { GraphService, Node, Edge } from '../graph.service';

@Component({
    selector: 'detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {
    selected : string | undefined;
    selectedLabel : string | undefined;
    selectedThumbnail : string | undefined;
    selectedLink : string | undefined;

    properties : { [key : string] : string } = {};

    constructor(
	private graph : GraphService,
    ) { }

    ngOnInit(): void {

	this.graph.propertiesEvents().subscribe(
	    ev => {

		this.properties = {};
		this.selectedThumbnail = undefined;
		this.selectedLink = undefined;

		for (let key in ev.properties) {
		    if (key == "thumbnail")
			this.selectedThumbnail = ev.properties[key];
		    if (key == "link")
			this.selectedLink = ev.properties[key];
		    else
			this.properties[key] = ev.properties[key];
		}
	    }
	);
	
	this.graph.nodeSelectEvents().subscribe(
	    ev => {

		this.selected = ev.node.id;

		if (ev.node.label)
		    this.selectedLabel = ev.node.label;
		else
		    this.selectedLabel = "-- undefined --";

	    }
	);

	this.graph.nodeDeselectEvents().subscribe(
	    ev => {
		if (this.selected == undefined) return;
		this.selected = undefined;
		this.selectedLabel = undefined;
		this.selectedLink = undefined;
	    }
	);

    }

}
