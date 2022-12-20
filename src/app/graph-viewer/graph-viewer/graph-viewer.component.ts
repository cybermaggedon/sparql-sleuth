
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { Triple } from '../../triple';
import { QueryService, Query } from '../../query.service';
import { GraphService, Node, Edge } from '../graph.service';

const RELATION = "http://purl.org/dc/elements/1.1/relation";
const LABEL = "http://www.w3.org/2000/01/rdf-schema#label";
const THUMBNAIL = "http://dbpedia.org/ontology/thumbnail";
const IS_A = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";

@Component({
    selector: 'graph-viewer',
    templateUrl: './graph-viewer.component.html',
    styleUrls: ['./graph-viewer.component.scss']
})
export class GraphViewerComponent implements OnInit {

    selected : string | undefined;
    selectedLabel : string | undefined;
    selectedThumbnail : string | undefined;
    selectedLink : string | undefined;

    constructor(
	private query : QueryService,
	private graph : GraphService,
	private router : Router,
	private route : ActivatedRoute,
    ) {

    }

    properties : { [key : string] : string } = {};

    fetchEdges = 25;

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

    }

    makeLabel(label : string) {

	if (label.startsWith("http://"))
            label = label.substr(label.lastIndexOf("/") + 1);

	if (label.lastIndexOf("#") >= 0)
            label = label.substr(label.lastIndexOf("#") + 1);

	if (label.length > 20)
	    label = label.substring(0, 30);

	return label;

    }

}

