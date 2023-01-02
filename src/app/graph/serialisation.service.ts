
import { Node, Edge } from './graph';

import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import { StateService } from './state.service';

@Injectable({
  providedIn: 'root'
})
export class SerialisationService {

    constructor(
	private state : StateService,
    ) {
    }

    deserialise(enc : string) {

	let dump = JSON.parse(enc);

	let gst = this.state.treeData;

	gst.nodes.clear();
	gst.edges.clear();

	let nmap : any = {};

	for(let node of dump["nodes"]) {

	    let n = new Node();
	    n.id = node["id"];
	    n.label = node["label"];
	    nmap[node["id"]] = n;

	    node["node"] = n;

	    gst.nodes.add(node);

	}

	for(let edge of dump["edges"]) {

	    let e = new Edge();
	    e.id = edge["id"];
	    e.label = edge["label"];
	    e.from = edge["from"];
	    e.to = edge["to"];

	    edge["arrows"] = "to";
	    edge["edge"] = e;
	    gst.edges.add(edge);

	}

	return of("");
    }


    serialise() {

	return new Observable<any>(
	    subs => {
	
		this.state.getPositions().subscribe(
		    (pos : any) => {


			let nodes : any[] = [];
			let edges : any[]  = [];

			let state = this.state.graphState();

			state.nodes.forEach(
			    (n : any) => {
//				console.log(n);
				
				let node : any = {
				    id: n.id,
				    label: n.label,
				};
				
				if (n.id in pos) {
				    node["x"] = pos[n.id].x;
				    node["y"] = pos[n.id].y;
				}

				nodes.push(node);

			    }
			);
			
			state.edges.forEach(
			    (e : any) => {
//				console.log(e);
				
				let edge : any = {
				    id: e.id,
				    label: e.label,
				    from: e.from,
				    to: e.to,
				};
				
				edges.push(edge);
				
			    }
			);

			let graph = {
			    nodes: nodes, edges: edges
			};

			subs.next(JSON.stringify(graph));
			subs.complete();

		    }

		);

	    }
	);

    }

}

