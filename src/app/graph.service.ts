
import { Injectable } from '@angular/core';
import { DataTriples, data } from './data';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';

import { Triple, Value, Uri } from './triple';

export class Node {
    id : string = "";
    label : string | null = null;
};

export class Edge {
    id : string = "";
    label : string | null = null;
    from : string = "";
    to : string = "";
};

export class AddNodeEvent {
    node : Node = new Node();
};

export class RemoveNodeEvent {
    id : string = "";
};

export class AddEdgeEvent {
    edge : Edge = new Edge();
};

export class RemoveEdgeEvent {
    id : string = "";
};

export class NodeSelectEvent {
    id : string = "";
};

@Injectable({
    providedIn: 'root'
})
export class GraphService {

    private addNodeSubject = new Subject<AddNodeEvent>;
    private removeNodeSubject = new Subject<RemoveNodeEvent>;
    private addEdgeSubject = new Subject<AddEdgeEvent>;
    private removeEdgeSubject = new Subject<RemoveEdgeEvent>;
    private nodeSelectSubject = new Subject<NodeSelectEvent>;
    private nodeDeselectSubject = new Subject<null>;

    addNodeEvents() { return this.addNodeSubject; }
    removeNodeEvents() { return this.removeNodeSubject; }
    addEdgeEvents() { return this.addEdgeSubject; }
    removeEdgeEvents() { return this.removeEdgeSubject; }
    nodeSelectEvents() { return this.nodeSelectSubject; }
    nodeDeselectEvents() { return this.nodeDeselectSubject; }

    addNode(node : Node) {
	let ev = new AddNodeEvent();
	ev.node = node;
	this.addNodeSubject.next(ev);
    }

    removeNode(id : string) {
	let ev = new RemoveNodeEvent();
	ev.id = id;
	this.removeNodeSubject.next(ev);
    }

    addEdge(edge : Edge) {
	let ev = new AddEdgeEvent();
	ev.edge = edge;
	this.addEdgeSubject.next(ev);
    }

    removeEdge(id : string) {
	let ev = new RemoveEdgeEvent();
	ev.id = id;
	this.removeEdgeSubject.next(ev);
    }

    select(id : string) {
	let ev = new NodeSelectEvent();
	ev.id = id;
	this.nodeSelectSubject.next(ev);
    }

    deselect() {
	this.nodeDeselectSubject.next(null);
    }

    constructor() {
    }

}

