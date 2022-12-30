
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
    BehaviorSubject, Subject, Observable, forkJoin, Subscriber, of,
    combineLatest
} from 'rxjs';
import { map } from 'rxjs/operators';

import { Node, Edge } from './graph';
import { Triple, Value, Uri } from '../rdf/triple';

import { QueryService } from '../query/query.service';
import { CommandService, Direction } from './command.service';

import { Relationship } from './graph';

export class AddNodeEvent {
    node : Node = new Node();
};

export class RemoveNodeEvent {
    id : Uri = new Uri("");
};

export class AddEdgeEvent {
    edge : Edge = new Edge();
};

export class RemoveEdgeEvent {
    id : Uri = new Uri("");
};

export class NodeSelectedEvent {
    node : Node = new Node();
};

export class RecentreEvent {
    id : Uri = new Uri("");
    relationship : string = "false";
};

@Injectable({
    providedIn: 'root'
})
export class EventService {

    constructor(
    ) {
    }

    private addNodeSubject = new Subject<AddNodeEvent>;
    private removeNodeSubject = new Subject<RemoveNodeEvent>;
    private addEdgeSubject = new Subject<AddEdgeEvent>;
    private removeEdgeSubject = new Subject<RemoveEdgeEvent>;
    private nodeSelectedSubject = new Subject<NodeSelectedEvent>;
    private nodeDeselectedSubject = new Subject<null>;
    private nodeUnselectSubject = new Subject<null>;
    private resetSubject = new Subject<null>;
    private recentreSubject = new Subject<RecentreEvent>;
    private schemaSubject = new Subject<null>;

    addNodeEvents() { return this.addNodeSubject; }
    removeNodeEvents() { return this.removeNodeSubject; }
    addEdgeEvents() { return this.addEdgeSubject; }
    removeEdgeEvents() { return this.removeEdgeSubject; }
    nodeSelectedEvents() { return this.nodeSelectedSubject; }
    nodeDeselectedEvents() { return this.nodeDeselectedSubject; }
    nodeUnselectEvents() { return this.nodeUnselectSubject; }
    resetEvents() { return this.resetSubject; }
    recentreEvents() { return this.recentreSubject; }
    schemaEvents() { return this.schemaSubject; }

    addNode(node : Node) {
	let ev = new AddNodeEvent();
	ev.node = node;
	this.addNodeSubject.next(ev);
    }

    removeNode(id : Uri) {
	let ev = new RemoveNodeEvent();
	ev.id = id;
	this.removeNodeSubject.next(ev);
    }

    addEdge(edge : Edge) {
	let ev = new AddEdgeEvent();
	ev.edge = edge;
	this.addEdgeSubject.next(ev);
    }

    removeEdge(id : Uri) {
	let ev = new RemoveEdgeEvent();
	ev.id = id;
	this.removeEdgeSubject.next(ev);
    }

    selected(n : Node) {
	let ev = new NodeSelectedEvent();
	ev.node = n;
	this.nodeSelectedSubject.next(ev);
    }

    deselected() {
	this.nodeDeselectedSubject.next(null);
    }

    unselect() {
	this.nodeUnselectSubject.next(null);
    }

    reset() {
	this.resetSubject.next(null);
    }

    recentre(id : Uri, relationship : string = "no") {
	let ev = new RecentreEvent();
	ev.id = id;
	ev.relationship = relationship;
	this.recentreSubject.next(ev);
    }

    schema() {
	this.schemaSubject.next(null);
    }

}

