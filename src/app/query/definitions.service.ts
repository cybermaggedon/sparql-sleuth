
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
import { Query } from './query';

import { IS_A, CLASS, LABEL } from '../rdf/defs';
import { Value, Uri, Literal } from '../rdf/triple';
import { QueryResult, Row } from './query';

const DATASET = new Uri("https://schema.org/Dataset");

type Params = { [key : string] : Value };

type QueryDef = any;
type PipeDef = any;
type InnerQueryDef = any;

//type QueryBuilder = (d : QueryDef, p : Params) => Query;
type QueryBuilder = any;
type PipeBuilder = any;
type InnerQueryBuilder = any;
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

	    let label = d["label"];
	    label = this.replaceParams(label, params);

	    return new POQuery(
		d["label"], d["pred"], d["id"], d["limit"]
	    );
	},
	po: (d : QueryDef, params : Params) : Query => {
	    let label = d["label"];
	    label = this.replaceParams(label, params);
	    return new POQuery(
		d["label"], params["pred"], params["id"], d["limit"]
	    );
	},
	raw: (d : QueryDef, params : Params) : Query => {

	    let label = d["label"];
	    let query = d["query"];

	    label = this.replaceParams(label, params);
	    query = this.replaceParams(query, params);
			  
	    return new RawQuery(label, query);
	},
	"text-search": 	(d : QueryDef, params : Params) : Query => {

	    let label = d["label"];
	    label = this.replaceParams(label, params);

	    return new TextSearchQuery(
		label, params["text"], this.textSearchResults,
	    );
	},
	"sp": (d : QueryDef, params : Params) : Query => {

	    let label = d["label"];
	    label = this.replaceParams(label, params);

	    return new SPQuery(
		label, params["id"], params["pred"],
		this.singlePropertyResults,
	    );
	},
	"s": (d : QueryDef, params : Params) : Query => {

	    let label = d["label"];
	    label = this.replaceParams(label, params);

	    return new SQuery(
		label, params["id"],
		this.propertyEdges,
	    );
	    
	},
	"label": (d : QueryDef, params : Params) : Query => {

	    let label = d["label"];
	    label = this.replaceParams(label, params);

	    return new LabelQuery(
		label, params["id"]
	    );
	},
	"relationship": (d : QueryDef, params : Params) : Query => {
	    let label = d["label"];
	    label = this.replaceParams(label, params);
	    return new RelationshipQuery(
		label, params["id"], d["inward"], d["limit"]
	    );
	},
    };

    private pipes : { [key : string] : PipeBuilder } = {
	"join-label": (d : PipeDef) => {
	    return this.joinLabel(d["input"], d["output"]);
	},
	"add-constant-column": (d : PipeDef) => {
	    return this.transform.addConstantColumn(d["column"], d["value"]);
	},
	"join-property": (d : PipeDef) => {
	    return this.transform.joinProperty(
		d["input"], d["output"],
		this.fromInnerQuery(d["query"])

	    );
	},
	"join-property-array": (d : PipeDef) => {
	    return this.transform.joinPropertyArray(
		d["input"], d["output"],
		this.fromInnerQuery(d["query"])

	    );
	},
	"to-triples": (d : PipeDef) => {
	    return this.transform.queryResultToTriples();
	},
	"to-o-values": (d : PipeDef) => {
	    return map(
		(qr : QueryResult) => qr.data.map(
		    (row : Row) => row["o"]
		)
	    );
	},
	"null-to-zero": (d : PipeDef) => {
	    return map(
		(res : QueryResult) => {
		    if (res.data.length > 0) {
			let key = res.vars[0];
			return [res.data[0][key]];
		    } else {
			return [new Literal("0")];
		    }
		}
	    );
	},
    };

    innerQueries : { [key : string] : InnerQueryBuilder } = {
	"to-count": (d : InnerQueryDef) => {
	    return (id : any) => this.toCount(id);
	},
	"to-property": (d : InnerQueryDef) => {
	    return (id : any) => this.toProperty(id, d["p"]);
	}
    };

    defs : { [key : string] : Definition } = {
	schema: {
	    label: "Acquire schema", kind: "po-from-defs",
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
		    kind: "to-o-values",
		}
	    ]
	},
	"property": {
	    label: "Properties %%id%%", kind: "s",
	    pipe: [
	    ]
	},
	"relationships-in": {
	    label: "Properties %%pred%% %%id%%", kind: "po",
	    limit: this.relationshipEdges,
	    pipe: [
	    ]
	},
	"relationships-out": {
	    label: "Properties %%id%% %%pred%%", kind: "sp",
	    limit: this.relationshipEdges,
	    pipe: [
	    ]
	},
	"relationship-kinds-in": {
	    label: "Relationships to %%id%%", inward: true,
	    kind: "relationship",
	    limit: this.relationshipEdges,
	    pipe: [
	    ]
	},
	"relationship-kinds-out": {
	    label: "Relationships from %%id%%", inward: false,
	    kind: "relationship",
	    limit: this.relationshipEdges,
	    pipe: [
	    ]
	},
	label: {
	    label: "Label %%id%%", kind: "label",
	    pipe: [
	    ]
	},
	count: {
	    label: "Count %%id%%", kind: "raw", 
	    query: 'SELECT (COUNT(*) AS ?count) WHERE {  ?s a <%%id%%> . }',
	    pipe: [
		{
		    kind: "null-to-zero"
		},
	    ]
	},
    };

    constructor(
        private transform : TransformService,
	private query : QueryService,
    ) {
    }

    private replaceParam(input : string, key : string, value : any) : string {
	let re = new RegExp("%%" + key + "%%", "g");

	if (value instanceof Uri || value instanceof Literal) {
	    return input.replace(re, value.value());
	} else if (typeof value === "string") {
	    return input.replace(re, value);
	} else {
	    console.log("ERROR", value);
	    throw Error("replaceParam can't handle value");
	}
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

    // FIXME: Return type
    private fromQuery(d : any, params : Params) : Observable<any> {

	if (!d["kind"]) throw Error("Query 'kind' must be provided");

	let qryFactory = this.queries[d["kind"]];

	if (!qryFactory) throw Error(
	    "Query kind " + d["kind"] + " is not defined"
	);

	let qry = qryFactory(d, params);

	let pipes = d["pipe"].map(
	    (d : any) => {
		let pipeFactory = this.pipes[d["kind"]];
		return pipeFactory(d);
	    }
	);

	return qry.run(this.query).pipe(...pipes);

    }

    private fromDef(id : string, params : Params) {
	let def = this.defs[id];
	if (!def) throw Error("Definition " + id + " not defined");
	return this.fromQuery(def, params);
    }

    // ----------------------------------------------------------------------

    // Entrypoints go here?
    
    schemaQuery() {
	return this.fromDef("schema", {});

    }

    datasetsQuery() : Observable<Row[]> {
	return this.fromDef("datasets", {});
    }

    tagQuery(tag : Value) {
	return this.fromDef("tag", {tag: tag});
    }

    textSearch(text : Value) {
	return this.fromDef("text-search", {text: text});
    }

    singlePropertyQuery(id : Uri, pred : Uri) {
	return this.fromDef(
	    "single-property",
	    { id: id, pred: pred }
	);
    }

    propertyQuery(id : Uri) {
	return this.fromDef("property", { id: id });
    }

    labelQuery(id : Uri) {
	return this.fromDef("label", { id: id });
    }

    relationshipsInward(id : Uri, rel : Uri) {
	return this.fromDef("relationships-in", { id: id, pred: rel });
    }

    relationshipsOutwards(id : Uri, rel : Uri) {
	return this.fromDef("relationships-out", { id: id, pred: rel });
    }


    relationshipKindsIn(id : Uri) {
	return this.fromDef("relationship-kinds-in", { id: id });
    }

    relationshipKindsOut(id : Uri) {
	return this.fromDef("relationship-kinds-out", { id: id });
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
	return this.singlePropertyQuery(id, pred);
    }
    
    private toCount(id : Uri) : Observable<Value[]> {
	return this.fromDef("count", { id: id });
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
