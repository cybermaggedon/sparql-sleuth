
import { Component, OnInit, Input } from '@angular/core';

import { GraphService } from '../../graph/graph.service';
import { Properties, PropertyMap } from '../../graph/properties.service';
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

    @Input("properties") allProperties : Properties = new Properties();

    get inward() {
	return this.relationships.filter( x => x.inward );
    }

    get outward() {
	return this.relationships.filter( x => !x.inward );
    }

    get properties() {
	return this.allProperties.properties;
    }

    noProperties() : boolean {
	return Object.keys(this.properties).length == 0;
    }

    get table() {

	let rows : {key: string, value: string}[] = [];

	for(let key in this.properties) {
	    rows.push({
		key: key, value: this.properties[key].value()
	    });
	}
	
	return rows;

    }

    constructor(
	private graph : GraphService,
	private command : CommandService,
    ) { }

    ngOnInit(): void {
    }

    get label() : string {
	if ("title" in this.properties) {
	    return this.properties["title"].value();
	} else if ("label" in this.properties) {
	    return this.properties["label"].value();
	} else
	    return "";
    }
    
    get link() : string {
	if ("link" in this.properties)
	    return this.properties["link"].value();
	else
	    return "";
    }

    get thumbnail() : string {
	if ("thumbnail" in this.properties)
	    return this.properties["thumbnail"].value();
	else
	    return "";
    }

    recentre() {
	if (this.selection)
	    this.command.recentre(this.selection.id);
    }

    reln(rel : Relationship) {
	if (!this.selection) return;
	this.command.relationship(this.selection, rel);
    }

}
