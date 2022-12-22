
import { Injectable } from '@angular/core';
import { Observable, forkJoin, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { Value } from '../query/triple';
import { QueryService } from '../query/query.service';
import { CommandService } from './command.service';

import { ExpansionsQuery } from '../query/expansion-query';
import { GraphService, Node} from './graph.service';

import { RELATION, THUMBNAIL, LABEL, IS_A } from '../rdf';

export class Expansion {
    name : string = "";
    id : string = "";
    inward : boolean = false;
};

@Injectable({
    providedIn: 'root'
})
export class ExpansionService {

    constructor(
	private command : CommandService,
	private query : QueryService,
	private graph : GraphService,
    ) {

    }

    expansionEdges = 25;

    getExpansionsIn(node : Node) {

	let qry = this.query.query(
	    new ExpansionsQuery(
		"Expand in " + node.id, node.id, true, this.expansionEdges
	    )
	);

	return qry.pipe(
	    map(
		(v : Value[]) =>
		v.map(
		    v => v.value
		).filter(
		    v => ((v != RELATION) && v != THUMBNAIL)
		)
	    )
	);

    }

    getExpansionsOut(node : Node) {

	let qry = this.query.query(
	    new ExpansionsQuery(
		"Expand out " + node.id, node.id, false, this.expansionEdges
	    )
	);

	return qry.pipe(
	    map(
		(v : Value[]) =>
		v.map(
		    v => v.value
		).filter(
		    v => ((v != RELATION) && v != THUMBNAIL)
		)
	    )
	);

    }

    getExpansionPreds(node : Node) : Observable<Expansion[]>{

	return new Observable<any>(

	    sub => {

		let inw = this.getExpansionsIn(node);

		let outw = this.getExpansionsOut(node);
	    
		// combineLatest maybe?

		forkJoin({
		    "in": inw,
		    "out": outw,
		}).pipe(
		    map(
			(res : any) => {
			
			    let exps : Expansion[] = [];
			    
			    for (let i of res["in"]) {
				let exp = new Expansion();
				exp.id = i;
				exp.inward = true;
				exps.push(exp);
			    }

			    for (let i of res["out"]) {
				let exp = new Expansion();
				exp.id = i;
				exp.inward = false;
				exps.push(exp);
			    }

			    return exps;

			}
		    )
		).subscribe(
		    exps => sub.next(exps)
		);

	    }
	);

    }

    getExpansions(node : Node) {

	return new Observable<Expansion[]>(
	    sub => {

		this.getExpansionPreds(node).subscribe(
		    exps => {
			    
			let todo : any[] = [];
			    
			for(let exp of exps) {

			    todo.push(this.graph.getLabel(exp.id).pipe(
				map(
				    (label : string) => {
					let e = new Expansion();
					e.id = exp.id;
					e.name = label;
					e.inward = exp.inward;
					return e;
				    }
				)
			    ));

			}

			combineLatest(todo).subscribe(
			    ev => {
				sub.next(ev);
			    }
			);

		    }
		);

	    }
	);

    }

}

