
import { Injectable } from '@angular/core';
import { map, Observable, of, OperatorFunction } from 'rxjs';

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
import { Query } from './query';

import { IS_A, CLASS, LABEL } from '../rdf/defs';
import { Value, Uri, Literal, Triple } from '../rdf/triple';
import { QueryResult, Row } from './query';

const DATASET = new Uri("https://schema.org/Dataset");

type Params = { [key : string] : Value };

type QueryDef = any;
type PipeDef = any;
type InnerQueryDef = any;

type QueryBuilder = (d : QueryDef, p : Params) => Query;
type PipeBuilder = (d : PipeDef) => Pipe;
type InnerQueryBuilder = (d : InnerQueryDef) => InnerQuery;

//type Pipe = (qr : QueryResult) => QueryResult;
type Pipe = OperatorFunction<QueryResult, QueryResult>;
type InnerQuery = (id : string) => Observable<Value[]>;

type Definition = any;

@Injectable({
    providedIn: 'root'
})
export class DefinitionsService {

    private textSearchResults = 100;
    private singlePropertyResults = 100;
    private relationshipEdges = 25;
    private propertyEdges = 25;
    private fetchEdges = "FIXME?";

    private queries : { [key : string] : QueryBuilder } = {
	"po-from-defs": (d : QueryDef, params : Params) : Query => {

	    let description = d["description"];
	    description = this.replaceParams(description, params);

	    return new POQuery(
		description, d["pred"], d["id"], d["limit"]
	    );
	},
	po: (d : QueryDef, params : Params) : Query => {
	    let description = d["description"];
	    description = this.replaceParams(description, params);
	    return new POQuery(
		description, params["pred"], params["id"], d["limit"]
	    );
	},
	raw: (d : QueryDef, params : Params) : Query => {

	    let description = d["description"];
	    let query = d["query"];

	    description = this.replaceParams(description, params);
	    query = this.replaceParams(query, params);
			  
	    return new RawQuery(description, query);
	},
	"text-search": 	(d : QueryDef, params : Params) : Query => {

	    let description = d["description"];
	    description = this.replaceParams(description, params);

	    return new TextSearchQuery(
		description, params["text"], this.textSearchResults,
	    );
	},
	sp: (d : QueryDef, params : Params) : Query => {

	    let description = d["description"];
	    description = this.replaceParams(description, params);

	    return new SPQuery(
		description, params["id"], params["pred"],
		this.singlePropertyResults,
	    );
	},
	s: (d : QueryDef, params : Params) : Query => {

	    let description = d["description"];
	    description = this.replaceParams(description, params);

	    return new SQuery(
		description, params["id"],
		this.propertyEdges,
	    );
	    
	},
	label: (d : QueryDef, params : Params) : Query => {

	    let description = d["description"];
	    description = this.replaceParams(description, params);

	    return new LabelQuery(
		description, params["id"]
	    );
	},
	relationship: (d : QueryDef, params : Params) : Query => {
	    let description = d["description"];
	    description = this.replaceParams(description, params);
	    return new RelationshipQuery(
		description, params["id"], d["inward"], d["limit"]
	    );
	},
    };

    private pipes : { [key : string] : PipeBuilder } = {
	"join-label": (d : PipeDef) : Pipe  => {
	    return this.joinLabel(d["input"], d["output"]);
	},
	"add-constant-column": (d : PipeDef) : Pipe => {
	    return this.transform.addConstantColumn(d["column"], d["value"]);
	},
	"join-property": (d : PipeDef) : Pipe => {
	    return this.transform.joinProperty(
		d["input"], d["output"],
		this.fromInnerQuery(d["query"])

	    );
	},
	"join-property-array": (d : PipeDef) : Pipe => {
	    return this.transform.joinPropertyArray(
		d["input"], d["output"],
		this.fromInnerQuery(d["query"])

	    );
	},
    };

    innerQueries : { [key : string] : InnerQueryBuilder } = {
	"to-count": (d : InnerQueryDef) : InnerQuery => {
	    return (id : any) => this.toCount(id);
	},
	"to-property": (d : InnerQueryDef) : InnerQuery => {
	    return (id : any) => this.toProperty(id, d["p"]);
	}
    };

    defs : { [key : string] : Definition } = {
	schema: {
	    description: "Acquire schema", kind: "po-from-defs",
	    pred: IS_A, id: CLASS, limit: 50,
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
                }
	    ]
	},
	datasets: {
	    description: "Acquire datasets", kind: "raw",
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
		}
	    ]
	},
	tag: {
	    description: "Keyword search %%tag%%", kind: "raw",
	    query: 'PREFIX schema: <https://schema.org/> SELECT DISTINCT ?s WHERE { ?s a schema:Dataset . ?s schema:keywords %%tag%% . } LIMIT 40',
	    pipe: [
		{
		    kind: "add-constant-column", column: "p", value: IS_A
		},
		{
		    kind: "add-constant-column", column: "o", value: DATASET
		}
	    ]
	},
	"text-search": {
	    description: "Search %%text%%", kind: "text-search",
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
	    description: "Property %%id%% %%pred%%", kind: "sp",
	    pipe: [
	    ]
	},
	"property": {
	    description: "Properties %%id%%", kind: "s",
	    pipe: [
	    ]
	},
	"relationships-in": {
	    description: "Properties %%pred%% %%id%%", kind: "po",
	    limit: this.relationshipEdges,
	    pipe: [
	    ]
	},
	"relationships-out": {
	    description: "Properties %%id%% %%pred%%", kind: "sp",
	    limit: this.relationshipEdges,
	    pipe: [
	    ]
	},
	"relationship-kinds-in": {
	    description: "Relationships to %%id%%", inward: true,
	    kind: "relationship",
	    limit: this.relationshipEdges,
	    pipe: [
	    ]
	},
	"relationship-kinds-out": {
	    description: "Relationships from %%id%%", inward: false,
	    kind: "relationship",
	    limit: this.relationshipEdges,
	    pipe: [
	    ]
	},
	label: {
	    description: "Label %%id%%", kind: "label",
	    pipe: [
	    ]
	},
	count: {
	    description: "Count %%id%%", kind: "raw", 
	    query: 'SELECT (COUNT(*) AS ?count) WHERE {  ?s a %%id%% . }',
	    pipe: [
	    ]
	},
    };

    constructor(
        private transform : TransformService,
	private query : QueryService,
    ) {
    }

    private replaceParam(input : string, key : string, value : Value) : string {
	let re = new RegExp("%%" + key + "%%", "g");
	return input.replace(re, value.term());
    }

    private replaceParams(input : string, params : Params) : string {
	for (let p in params) {
	    input = this.replaceParam(input, p, params[p]);
	}
	return input;
    }

    // FIXME: Return type
    private fromInnerQuery(d : any) : any {

	let mapFactory = this.innerQueries[d["kind"]];

	let innerQuery = mapFactory(d);

	/*
	  // Not using pipes for inner queries
	if ("pipe" in d) {
	    let pipes = d["pipe"].map(
		(d : any) => {
		    let pipeFactory = this.pipes[d["kind"]];
		    return pipeFactory(d);
		}
	    );

	    return innerQuery.pipe(...pipes);

	    } */

	return innerQuery;

    }

    // FIXME: Return type
    private fromQuery(d : any, params : Params) : Observable<any> {

	if (!d["kind"]) throw Error("Query 'kind' must be provided");

	let qryFactory = this.queries[d["kind"]];

	if (!qryFactory) throw Error(
	    "Query kind " + d["kind"] + " is not defined"
	);

	let qry = qryFactory(d, params);

	let pipes : Pipe[] = d["pipe"].map(
	    (d : any) => {
		let pipeFactory = this.pipes[d["kind"]];
		return pipeFactory(d);
	    }
	);

	// Doesn't compile???
//	return qrs.run(this.query).pipe(...pipes);

	let qrs : Observable<QueryResult> = qry.run(this.query);

	for(let pipe of pipes)
	    qrs = qrs.pipe(pipe);

	return qrs;

    }

    private fromDef(id : string, params : Params) {
	let def = this.defs[id];
	if (!def) throw Error("Definition " + id + " not defined");
	return this.fromQuery(def, params);
    }

    // ----------------------------------------------------------------------

    // Entrypoints go here?
    
    schemaQuery() : Observable<QueryResult> {
	return this.fromDef("schema", {});

    }

    datasetsQuery() : Observable<QueryResult> {
	return this.fromDef("datasets", {});
    }

    tagQuery(tag : Value) : Observable<Triple[]> {
	return this.fromDef("tag", {tag: tag}).pipe(
	    this.transform.queryResultToTriples()
	);
    }

    textSearch(text : Value) : Observable<QueryResult> {
	return this.fromDef("text-search", {text: text});
    }

    singlePropertyQuery(id : Uri, pred : Uri) : Observable<QueryResult> {
	return this.fromDef("single-property", { id: id, pred: pred });
    }

    propertyQuery(id : Uri) : Observable<QueryResult> {
	return this.fromDef("property", { id: id });
    }

    labelQuery(id : Uri) : Observable<string> {
	return this.fromDef("label", { id: id }).pipe(
	    map(
		res => {
		    if (res.data.length > 0) {
			let key = res.vars[0];
			return res.data[0][key].value();
		    } else
			return this.transform.makeLabel(id);
		}
	    )
	);	    
    }

    relationshipsInward(id : Uri, rel : Uri) : Observable<QueryResult> {
	return this.fromDef("relationships-in", { id: id, pred: rel });
    }

    relationshipsOutwards(id : Uri, rel : Uri) : Observable<QueryResult> {
	return this.fromDef("relationships-out", { id: id, pred: rel });
    }


    relationshipKindsIn(id : Uri) : Observable<Value[]> {
	return this.fromDef("relationship-kinds-in", { id: id }).pipe(
	    map((res : QueryResult) => res.data.map(row => row["pred"]))
	);
    }

    relationshipKindsOut(id : Uri) : Observable<Value[]> {
	return this.fromDef("relationship-kinds-out", { id: id }).pipe(
	    map((res : QueryResult) => res.data.map(row => row["pred"]))
	);
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

    // ----------------------------------------------------------------------

    private toProperty(id : Uri, pred : Uri) : Observable<Value[]> {
	return this.singlePropertyQuery(id, pred).pipe(
	     map(
		(qr : QueryResult) => qr.data.map(
		    (row : Row) => row["o"]
		)
	     )
	);
    }
    
    private toCount(id : Uri) : Observable<Value[]> {
	return this.fromDef("count", { id: id }).pipe(
	    map(
		(res : QueryResult) => {
		    if (res.data.length > 0) {
			let key = res.vars[0];
			return [res.data[0][key]];
		    } else {
			return [new Literal("0")];
		    }
		}
	    )
	);
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
