
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { StateService } from './state.service';

@Injectable({
  providedIn: 'root'
})
export class SerialisationService {

    constructor(
	private state : StateService,
    ) {
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
				
				let node : any = { id: n.id };
				
				if (n.id in pos) {
				    node["x"] = pos[n.id]["x"];
				    node["y"] = pos[n.id]["y"];
				}

				nodes.push(node);

			    }
			);
			
			state.edges.forEach(
			    (e : any) => {
				
				let edge : any = {
				    from: e["from"],
				    to: e["to"],
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

