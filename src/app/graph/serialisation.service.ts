
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

	console.log(dump);

	let gst = this.state.treeData;

	gst.nodes.clear();

	for(let node of dump["nodes"])
	    gst.nodes.add(node);

	for(let edge of dump["edges"])
	    gst.edges.add(edge);

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

				console.log(e);
				
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

