
import { Injectable } from '@angular/core';
import { DataTriples, data } from './data';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Triple, Value, Uri } from './triple';

@Injectable({
    providedIn: 'root'
})
export class QueryService {

    data : DataTriples;

    constructor(private httpClient : HttpClient) {
	this.data = data;
    }

    query(
	s : string | undefined, p : string | undefined,
	o : Uri | string | undefined,
	limit : number = 100
    ) : Observable<Triple[]> {

	let query = "";

	query += "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n";

	query += "SELECT DISTINCT ?s ?p ?o WHERE {\n";
	query += "  ?s ?p ?o .\n";

	if (s) {
	    if (s.startsWith("http://"))
		query += "  FILTER(?s = <" + s + ">) .\n";
	    else
		query += "  FILTER(?s = \"" + s + "\") .\n";
	}

	if (p) {
	    if (p.startsWith("http://"))
		query += "  FILTER(?p = <" + p + ">) .\n";
	    else
		query += "  FILTER(?p = \"" + p + "\") .\n";
	}

	if (o) {
	    if (o.startsWith("http://"))
		query += "  FILTER(?o = <" + o + ">) .\n";
	    else
		query += "  FILTER(?o = \"" + o + "\") .\n";
	}

	query += "}\n";
	query += "LIMIT " + limit + "\n";

	query = encodeURIComponent(query);
	let body = "query=" + query + "&output=json";

	return this.httpClient.post(
	    "/sparql",
	    body,
	    {},
	).pipe(
	    map((res : any) => {

		let triples : Triple[] = [];

		for (let row of res.results.bindings) {

		    let s = row.s.value;

		    let p = row.p.value;

		    let o;

		    if (row.o.type == "uri")
			o = new Value(row.o.value, true);
		    else
			o = new Value(row.o.value, false);

		    let triple = new Triple(s, p, o);

		    triples.push(triple);

		}

		return triples;

	    })
	);

    }

}



