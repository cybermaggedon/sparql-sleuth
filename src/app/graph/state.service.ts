
import { Injectable } from '@angular/core';
import { Subject, take, tap, of, Observable } from 'rxjs';

import { DataSet } from 'vis-network/standalone';
import { EventService } from './event.service';

@Injectable({
  providedIn: 'root'
})
export class StateService {

    // Clunky linkage to get position information from graph components
    requestPositions = new Subject<void>;
    reportPositions = new Subject<any>;

    edges : any = new DataSet([]);
    nodes : any = new DataSet([]);

    treeData : any = {
	edges: this.edges,
	nodes: this.nodes,
    }

    getPositions() {

	return new Observable<any>(
	    subs => {

		this.reportPositions.pipe(
		    take(1)
		).subscribe(
		    res => { subs.next(res); subs.complete(); }
		);

		this.requestPositions.next();

	    }
	);

    }

    constructor(
	private events : EventService,
    ) {

	this.events.addNodeEvents().subscribe(
	    ev => {
		if (this.nodes.get(ev.node.id) == null) {
		    this.nodes.add({
			id: ev.node.id,
			node: ev.node,
			label: this.wrap(ev.node.label),
		    });
		}
	    }

	)

	this.events.removeNodeEvents().subscribe(
	    ev => {
		if (this.nodes.get(ev.id))
		    this.nodes.remove(ev.id);
	    }
	)

	this.events.addEdgeEvents().subscribe(
	    ev => {
		if (this.edges.get(ev.edge.id) == null) {
		    this.edges.add({
			id: ev.edge.id,
			edge: ev.edge,
			label: this.wrap(ev.edge.label),
			from: ev.edge.from,
			to: ev.edge.to,
			arrows: "to",
		    });
		}
	    }
	)

	this.events.removeEdgeEvents().subscribe(
	    ev => {
		if (this.edges.get(ev.id))
		    this.edges.remove(ev.id);
	    }
	)

	this.events.resetEvents().subscribe(
	    ev => {
		this.nodes.clear();
		this.edges.clear();
	    }
	)

    }

    graphState() {
	return this.treeData;
    }

    wrap(s : string | null) : string {
	if (s == null) return "";
	return s.replace(
	    /(?![^\n]{1,32}$)([^\n]{1,32})\s/g, '$1\n'
	);
    }

}
