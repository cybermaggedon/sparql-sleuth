
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

@Injectable({
    providedIn: 'root'
})
export class GraphService {

    private addNodeSubject = new Subject<AddNodeEvent>;
    private removeNodeSubject = new Subject<RemoveNodeEvent>;
    private addEdgeSubject = new Subject<AddEdgeEvent>;
    private removeEdgeSubject = new Subject<RemoveEdgeEvent>;

    addNode() { return this.addNodeSubject; }
    removeNode() { return this.removeNodeSubject; }
    addEdge() { return this.addEdgeSubject; }
    removeEdge() { return this.removeEdgeSubject; }

    constructor() {
    }

}

