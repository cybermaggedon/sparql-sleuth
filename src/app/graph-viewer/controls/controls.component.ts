
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CommandService, Direction } from '../command.service';
import { SelectionService } from '../selection.service';
import { GraphService, Node } from '../graph.service';
import { QueryService, Query } from '../../query.service';
import { ProgressService, ProgressEvent, Activity } from '../../progress.service';

@Component({
  selector: 'controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss']
})
export class ControlsComponent implements OnInit {

    selection : Node | null = null;

    info1 : string = "";
    info2 : string = "";

    constructor(
	private command : CommandService,
	private select : SelectionService,
	private graph : GraphService,
	private router : Router,
	private query : QueryService,
	private progress : ProgressService,
    ) {

	this.graph.nodeSelectEvents().subscribe(
	    ev => this.selection = ev.node
	);

	this.graph.nodeDeselectEvents().subscribe(
	    () => this.selection = null
	);

	this.progress.progressEvents().subscribe(

	    (res : ProgressEvent) => {

		let a = Array.from(res.progress.values());

		if (a.length > 0)
		    this.info1 = a[0] + " ...";
		else
		    this.info1 = "";

		if (a.length > 1)
		    this.info2 = a[1] + " ...";
		else
		    this.info2 = "";

	    }

	);

    }

    ngOnInit(): void {
    }

    expandIn() {
	if (this.selection)
	    this.command.expand(Direction.IN, this.selection.id);
    }

    expandOut() {
	if (this.selection)
	    this.command.expand(Direction.OUT, this.selection.id);
    }

    restart() {
	this.router.navigate(
	    ["/"]
	);
    }

    recentre() {
	if (this.selection)
	    this.command.recentre(this.selection.id);
    }

    schema() {
	this.command.showSchema();
    }

}
