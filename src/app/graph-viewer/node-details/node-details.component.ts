
import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { GraphService } from '../../graph/graph.service';
import { Properties, Property } from '../../graph/properties.service';
import { Node, Relationship } from '../../graph/graph';
import { CommandService, Direction } from '../../command.service';

@Component({
    selector: 'node-details',
    templateUrl: './node-details.component.html',
    styleUrls: ['./node-details.component.scss']
})
export class NodeDetailsComponent implements OnInit {

    selected : string | undefined;
    selectedLabel : string | undefined;
    selectedThumbnail : string | undefined;
    selectedLink : string | undefined;

    @Input()
    relationships : Relationship[] = [];

    @Input()
    selection? : Node;

    @Input("properties") props : Properties = new Properties();

    constructor(
	private graph : GraphService,
	private command : CommandService,
	private router : Router,
    ) { }

    get inward() {
	return this.relationships.filter( x => x.inward );
    }

    get outward() {
	return this.relationships.filter( x => !x.inward );
    }

    get properties() : {key : string, value : string}[] {
	return this.props.properties.map(
	    prop => {
		return {
		    key: prop.key,
		    value: prop.value.value()
		}
	    }
	);
    }

    noProperties() : boolean {
	return Object.keys(this.props).length == 0;
    }

    ngOnInit(): void {
    }

    get thumbnail() : string {
	return this.props.get("thumbnail");
    }

    get label() : string {
	return this.props.get("label");
    }

    get link() : string {
	return this.props.get("link");
    }

    recentre() {
	if (this.selection) {
	    this.router.navigate(
		['/graph'],
		{
		    queryParams: {
			"node": this.selection.id,
			"announce": "no",
		    }
		}
	    );
	}
    }

    reln(rel : Relationship) {
	if (!this.selection) return;
	this.command.relationship(this.selection, rel);
    }

}
