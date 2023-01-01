
import { Component, OnInit, Input } from '@angular/core';

import { RelationshipService } from '../../graph/relationship.service';
import { Properties } from '../../graph/properties.service';
import { Node, Relationship } from '../../graph/graph';
import { CommandService, Direction } from '../../graph/command.service';

@Component({
    selector: 'node-details',
    templateUrl: './node-details.component.html',
    styleUrls: ['./node-details.component.scss']
})
export class NodeDetailsComponent implements OnInit {

    constructor(
	private command : CommandService
    ) {
    }

    @Input()
    relationships : Relationship[] = [];

    get inward() {
	return this.relationships.filter( x => x.inward );
    }

    get outward() {
	return this.relationships.filter( x => x.inward );
    }

    @Input()
    properties : Properties = new Properties();

    @Input()
    selection? : Node;

    ngOnInit(): void {
    }

    reln(rel : Relationship) {
	if (!this.selection) return;
	this.command.relationship(this.selection, rel);
    }

    recentre() {
	if (this.selection)
	    this.command.recentre(this.selection.id);
    }

}

