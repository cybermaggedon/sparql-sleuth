
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';

import { TransformService } from '../transform/transform.service';
import { QueryService } from './query.service';

import { POQuery } from './p-o-query';
import { SPQuery } from './s-p-query';
import { RawQuery } from './raw-query';
import { TextSearchQuery } from './text-search-query';
import { OQuery } from './o-query';
import { SQuery } from './s-query';
import { LabelQuery } from './label-query';
import { RelationshipQuery } from './relationship-query';

import { IS_A, CLASS, LABEL } from '../rdf/defs';
import { Value, Uri, Literal } from '../rdf/triple';

const DATASET = new Uri("https://schema.org/Dataset");

type Params = { [key : string] : any };

@Injectable({
    providedIn: 'root'
})
export class DefinitionsService {

    constructor(
        private transform : TransformService,
	private query : QueryService,
    ) {
    }

    queries : { [key : string] : any } = {
	po: (d : any, p : Params) => {
	    return new POQuery(
		d["label"], d["p"], d["o"], d["limit"]
	    );
	},
	raw: (d : any, params : Params) => {

	    let label = d["label"];
	    let query = d["query"];

	    for (let p in params) {
		let re = new RegExp("%%" + p + "%%", "g");
		label = label.replace(re, params[p]);
		query = query.replace(re, params[p]);
	    }
			  
	    return new RawQuery(label, query);
	},
	"text-search": 	(d : any, params : Params) => {

	    let label = d["label"];
	    
	    for (let p in params) {
		let re = new RegExp("%%" + p + "%%", "g");
		label = label.replace(re, params[p]);
	    }

	    return new TextSearchQuery(
		label, params["text"], this.textSearchResults,
	    );
	},
	"sp": 	(d : any, params : Params) => {

	    let label = d["label"];
	    
	    for (let p in params) {
		let re = new RegExp("%%" + p + "%%", "g");
		label = label.replace(re, params[p]);
	    }

	    return new SPQuery(
		label, params["id"], params["pred"],
		this.singlePropertyResults,
	    );
	}
    };

    pipes : { [key : string] : any } = {
	"join-label": (d : any) => {
	    return this.joinLabel(d["input"], d["output"]);
	},
	"add-constant-column": (d : any) => {
	    return this.transform.addConstantColumn(d["column"], d["value"]);
	},
	"join-property": (d : any) => {
	    return this.transform.joinProperty(
		d["input"], d["output"],
		this.fromInnerQuery(d["query"])

	    );
	},
	"join-property-array": (d : any) => {
	    return this.transform.joinPropertyArray(
		d["input"], d["output"],
		this.fromInnerQuery(d["query"])

	    );
	},
	"to-data": (d : any) => {
	    return map((x : any) => x.data)
	},
	"to-triples": (d : any) => {
	    return this.transform.queryResultToTriples();
	},
    };

    innerQueries : { [key : string] : any } = {
	"to-count": (d : any) => {
	    return (id : any) => this.toCount(id);
	},
	"to-property": (d : any) => {
	    return (id : any) => this.toProperty(id, d["p"]);
	}
    };

    textSearchResults = 100;
    singlePropertyResults = 100;

    fromInnerQuery(d : any) {

	let mapFactory = this.innerQueries[d["kind"]];

	let innerQuery = mapFactory(d);

	if ("pipe" in d) {
	    let pipes = d["pipe"].map(
		(d : any) => {
		    let pipeFactory = this.pipes[d["kind"]];
		    return pipeFactory(d);
		}
	    );

	    return innerQuery.pipe(...pipes);

	} else {
	    return innerQuery;
	}
    }

    fromQuery(d : any, params : Params) {

	let qryFactory = this.queries[d["kind"]];

	let qry = qryFactory(d, params);

	let pipes = d["pipe"].map(
	    (d : any) => {
		let pipeFactory = this.pipes[d["kind"]];
		return pipeFactory(d);
	    }
	);

	return qry.run(this.query).pipe(...pipes);

    }

    fromDef(id : string, params : Params) {
	return this.fromQuery(this.defs[id], params);
    }

    defs : { [key : string] : any } = {
	schema: {
	    label: "Acquire schema", kind: "po", p: IS_A, o: CLASS, limit: 50,
	    pipe: [
		{
		    kind: "join-label", input: "s", output: "slabel"
		},
		{
		    kind: "add-constant-column", column: "p", value: IS_A
		},
		{
		    kind: "join-label", input: "p", output: "plabel"
		},
		{
		    kind: "add-constant-column", column: "o", value: CLASS
		},
		{
		    kind: "join-property", input: "s", output: "count",
		    query: { kind: "to-count" }
                },
		{
		    kind: "to-data"
		}
	    ]
	},
	datasets: {
	    label: "Acquire datasets", kind: "raw",
	    query: "PREFIX schema: <https://schema.org/> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> SELECT ?dataset WHERE { ?dataset a schema:Dataset . } GROUP BY ?dataset LIMIT 40",
	    pipe: [
		{
		    kind: "join-property", input: "dataset", output: "title",
		    query: { "kind": "to-property", "p": LABEL }
		},
		{
		    kind: "join-property", input: "dataset", output: "url",
		    query: {
			"kind": "to-property",
			"p": new Uri("https://schema.org/url")
		    }
		},
		{
		    kind: "join-property", input: "dataset",
		    output: "description",
		    query: {
			"kind": "to-property",
			"p": new Uri("https://schema.org/description")
		    }
		},
		{
		    kind: "join-property", input: "dataset",
		    output: "authorid",
		    query: {
			"kind": "to-property",
			"p": new Uri("https://schema.org/author")
		    }
		},
		{
		    kind: "join-property", input: "authorid",
		    output: "author",
		    query: {
			"kind": "to-property", "p": LABEL
		    }
		},
		{
		    kind: "join-property-array", input: "dataset",
		    output: "keywords",
		    query: {
			"kind": "to-property",
			"p": new Uri("https://schema.org/keywords")
		    }
		},
		{
		    kind: "to-data"
		}		
	    ]
	},
	tag: {
	    label: "Keyword search %%tag%%", kind: "raw",
	    query: 'PREFIX schema: <https://schema.org/> SELECT DISTINCT ?s WHERE { ?s a schema:Dataset . ?s schema:keywords "%%tag%%" . } LIMIT 40',
	    pipe: [
		{
		    kind: "add-constant-column", column: "p", value: IS_A
		},
		{
		    kind: "add-constant-column", column: "o", value: DATASET
		},
		{
		    kind: "to-triples"
		}
	    ]
	},
	"text-search": {
	    label: "Search %%text%%", kind: "text-search",
	    limit: this.textSearchResults,
	    pipe: [
		{
		    kind: "join-label", input: "s", output: "slabel"
		},
		{
		    kind: "join-label", input: "p", output: "plabel"
		}
	    ]
	},
	"single-property": {
	    label: "Property %%id%% %%pred%%", kind: "sp",
	    pipe: [
		{
		    kind: "o-values",
		}
	    ]
	},
    };

    schemaQuery() {
	return this.fromDef("schema", {});

    }

    datasetsQuery() {
	return this.fromDef("datasets", {});
    }

    tagQuery(tag : string) {
	return this.fromDef("tag", {tag: tag});
    }

    textSearch(text : string) {
	return this.fromDef("text-search", {text: text});
    }

    singlePropertyQuery(id : Uri, pred : Uri) {
/*
	return this.fromDef(
	    "single-property",
	    { id: id, pred: pred }
	);
*/
	return new SPQuery(
	    "Property " + id.value() + " " + pred.value(),
	    id,
	    pred
	).run(
	    this.query
	).pipe(
	    map(qr => qr.data.map(row => row["o"])),
	);
    }

    toData() {
	return map((x : any) => x.data);
    }

    toProperty(id : Uri, pred : Uri) : Observable<Value[]> {
	return this.singlePropertyQuery(id, pred);
    }

    joinLabel(id : string, dest : string) {
	return this.transform.joinProperty(
	    id, dest,
	    (id) => this.toProperty(id, LABEL).pipe(
		map(
		    res => {
			if (res.length == 0)
			    return [
				new Literal(this.transform.makeLabel(id))
			    ];
			else
			    return res;
		    }
		)
	    )
	);
    }

    propertyEdges = 25;

    propertyQuery(id : string) {
    
	return new SQuery(
	    "Fetch " + id,
	    new Uri(id),
	    this.propertyEdges,
	).run(
	    this.query
	);

    }

    labelQuery(id : Uri) {
	return new LabelQuery("Label " + id, id).run(
	    this.query
	);
    }

    fetchEdges = 40;

    relationshipsIn(id : Uri) {
	return new OQuery(
	    "Relationship in " + id.value(),
	    id,
	    this.fetchEdges,
	).run(
	    this.query
	);
    }

    relationshipsOut(id : Uri) {
	return new SQuery(
	    "Relationship out " + id.value(),
	    id,
	    this.fetchEdges,
	).run(
	    this.query
	);
    }

    relationshipsInward(id : string, rel : Uri) {
	return new POQuery(
	    "Relationship to " + id,
	    rel,
	    new Uri(id),
	    this.fetchEdges,
	).run(
	    this.query
	);
    }

    relationshipsOutwards(id : string, rel : Uri) {
	return new SPQuery(
	    "Relationship to " + id,
	    new Uri(id),
	    rel,
	    this.fetchEdges,
	).run(
	    this.query
	);
    }

    relationshipEdges = 25;

    relationshipKindsIn(id : string) {
    	return new RelationshipQuery(
	    "Relationships to " + id, new Uri(id), true,
	    this.relationshipEdges
	).run(
	    this.query
	);
    }

    relationshipKindsOut(id : string) {
   	return new RelationshipQuery(
	    "Relationships from " + id, new Uri(id), false,
	    this.relationshipEdges
	).run(
	    this.query
	)
    }

    toCount(id : Uri) : Observable<Value[]> {

	let qry = "SELECT (COUNT(*) AS ?count) WHERE {  ?s a " +
	    id.term() + ". }";

	return new RawQuery("Count " + id.value(), qry).run(
	    this.query
	).pipe(
	    map(res => {
		if (res.data.length > 0) {
		    let key = res.vars[0];
		    return [res.data[0][key]];
		} else {
		    return [new Literal("0")];
		}
	    })
	)
    }

}



/*

  Alternative datasets query

  
	const qry = `
PREFIX schema: <https://schema.org/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT ?dataset ?title ?description ?url ?author (GROUP_CONCAT(?keyword,",") as ?keywords)
WHERE {
    ?dataset a schema:Dataset .
    OPTIONAL { ?dataset rdfs:label ?title }
    OPTIONAL { ?dataset schema:description ?description }
    OPTIONAL { ?dataset schema:url ?url }
    OPTIONAL {
        ?dataset schema:author ?authorid .
        ?authorid rdfs:label ?author
    }
    OPTIONAL { ?dataset schema:keywords ?keyword }
}
GROUP BY ?dataset
LIMIT 40
`;
*/
