
import { Injectable } from '@angular/core';
import { Observable, forkJoin, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { Value, Uri } from '../query/triple';
import { QueryService } from '../query/query.service';
import { CommandService } from './command.service';

import { RelationshipQuery } from '../query/relationship-query';
import { GraphService} from './graph.service';
import { Node, Edge, Relationship } from './graph';

import { SEE_ALSO, THUMBNAIL, LABEL, IS_A } from '../rdf';

@Injectable({
    providedIn: 'root'
})
export class RelationshipService {

    constructor(
	private command : CommandService,
	private query : QueryService,
	private graph : GraphService,
    ) {

    }

    relationshipEdges = 25;

    ignoreRelationship(p : Value) {
	if (!p.is_uri()) return false;
	if (p.value() == THUMBNAIL.value()) return true;
	if (p.value() == SEE_ALSO.value()) return true;
	return false;
    }

    getRelationshipsIn(node : Node) : Observable<Value[]> {

    	return new RelationshipQuery(
	    "Relationships to " + node.id, new Uri(node.id), true,
	    this.relationshipEdges
	).run(
	    this.query
	).pipe(
	    map(
		(v : Value[]) => v.filter(
		    v => !this.ignoreRelationship(v)
		)
	    )
	);

    }

    getRelationshipsOut(node : Node) : Observable<Value[]> {

    	return new RelationshipQuery(
	    "Relationships from " + node.id, new Uri(node.id), false,
	    this.relationshipEdges
	).run(
	    this.query
	).pipe(
	    map(
		(v : Value[]) => v.filter(
		    v => !this.ignoreRelationship(v)
		)
	    )
	);

    }

    getRelationshipPreds(node : Node) : Observable<Relationship[]>{

	return new Observable<any>(

	    sub => {

		let inw = this.getRelationshipsIn(node);

		let outw = this.getRelationshipsOut(node);
	    
		// combineLatest maybe?

		forkJoin({
		    "in": inw,
		    "out": outw,
		}).pipe(
		    map(
			(res : { [key : string] : Value[] }) => {
			
			    let exps : Relationship[] = [];
			    
			    for (let i of res["in"]) {
				let exp = new Relationship();

				// Assumption
				exp.id = i as Uri;
				exp.inward = true;
				exps.push(exp);
			    }

			    for (let i of res["out"]) {
				let exp = new Relationship();

				// Assumption
				exp.id = i as Uri;
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

    getRelationships(node : Node) {

	return new Observable<Relationship[]>(
	    sub => {

		this.getRelationshipPreds(node).subscribe(
		    exps => {
			    
			let todo : any[] = [];
			    
			for(let exp of exps) {

			    todo.push(this.graph.getLabel(exp.id).pipe(
				map(
				    (label : string) => {
					let e = new Relationship();
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

