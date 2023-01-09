
import {
    Component, OnInit, ViewChild, Input, AfterViewInit, OnChanges,
    ElementRef,
} from '@angular/core';

import { Network, DataSet } from 'vis-network/standalone';

import { Triple } from '../../rdf/triple';
import { EventService } from '../../graph/event.service';
import { StateService } from '../../graph/state.service';

@Component({
    selector: 'graph',
    templateUrl: './graph.component.html',
    styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit {

    @ViewChild("network") networkContainer: ElementRef | undefined;

    public network: any = null;

    state : any;

    constructor(
	private events : EventService,
	private graphState : StateService,
    ) {

	this.state = this.graphState.graphState();

	this.graphState.requestPositions.subscribe(
	    () => {
		this.graphState.reportPositions.next(this.network.getPositions());
	    }
	);

    }

    ngOnInit() {
    }
    
    ngAfterViewInit() {

	var options = {
	    interaction: {
	    },
	    physics: {
		barnesHut: {
		    gravitationalConstant: -30000,
		}
	    }
	};

	var container = this.networkContainer?.nativeElement;
	
	this.network = new Network(container, this.state, options);

	this.network.on("select", (params: any) => {
	    if (params.nodes.length == 1) {
		let id = params.nodes[0];
		let node = this.state.nodes.get(id).node;
		this.events.selected(node);
	    } else {
		this.events.deselected();
	    }
	});

	// Dragging a node appears to select it, but not trigger the
	// select event.  This causes a UI inconsistency because subsequently
	// clicking on the event doesn't cause a select event.
	this.network.on("dragStart", (params : any) => {
	/*
	    if (params.nodes.length == 1) {
	        let id = params.nodes[0];
		let node = cmp.nodes.get(id).node;
		cmp.events.selected(node);
	    }
	    */
	});

	this.network.on("dragEnd", (params : any) => {
	    this.network.unselectAll();
	});

	this.events.nodeUnselectEvents().subscribe(
	    ev => {
		this.network.unselectAll();
	    }
	);

    }

}

