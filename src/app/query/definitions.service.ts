
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
	po: (d : any) => {
	    return new POQuery(
		d["label"], d["p"], d["o"], d["limit"]
	    );
	},
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
		this.fromMapping(d["query"])

	    );
	},
	"to-data": (d : any) => {
	    return map((x : any) => x.data)
	},

    };

    mappings : { [key : string] : any } = {
	"to-count": (d : any) => {
	    return (id : any) => this.toCount(id);
	}
    };

    fromMapping(d : any) {

	let mapFactory = this.mappings[d["kind"]];

	let mapping = mapFactory(d);

	if ("pipe" in d) {
	    let pipes = d["pipe"].map(
		(d : any) => {
		    let pipeFactory = this.pipes[d["kind"]];
		    
		    return pipeFactory(d);
		}
	    );

	    return mapping.pipe(...pipes);

	} else {
	    return mapping;
	}
    }

    fromQuery(d : any) {

	let qryFactory = this.queries[d["kind"]];

	let qry = qryFactory(d);

	let pipes = d["pipe"].map(
	    (d : any) => {
		let pipeFactory = this.pipes[d["kind"]];
		return pipeFactory(d);
	    }
	);

	return qry.run(this.query).pipe(...pipes);

    }

    fromDef(d : any) {
	return this.fromQuery(d);
    }

    schemaQuery() {

	let def = {
	    label: "Acquire schema",
	    kind: "po",
	    p: IS_A,
	    o: CLASS,
	    limit: 50,
	    pipe: [
		{
		    kind: "join-label",
		    input: "s",
		    output: "slabel"
		},
		{
		    kind: "add-constant-column",
		    column: "p",
		    value: IS_A
		},
		{
		    kind: "join-label",
		    input: "p",
		    output: "plabel"
		},
		{
		    kind: "add-constant-column",
		    column: "o",
		    value: CLASS
		},
		{
		    kind: "join-property",
		    input: "s",
		    output: "count",
		    query: {
			label: "Count",
			kind: "to-count"
		    }
                },
		{
		    kind: "to-data"
		}
	    ]
	};

	let qry = this.fromDef(def);

	return qry;

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

    datasetsQuery() {

		const qry = `
PREFIX schema: <https://schema.org/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT ?dataset
WHERE {
    ?dataset a schema:Dataset .
}
GROUP BY ?dataset
LIMIT 40
`;

	return new RawQuery(
	    "Acquire datasets", qry
	).run(
	    this.query
	).pipe(
	    this.transform.joinProperty(
		"dataset", "title",
		(id) => this.toProperty(id, LABEL)
	    ),
	    this.transform.joinProperty(
		"dataset",
		"url",
		(id) => this.toProperty(id, new Uri("https://schema.org/url"))
	    ),
	    this.transform.joinProperty(
		"dataset",
		"description",
		(id) => this.toProperty(
		    id, new Uri("https://schema.org/description")
		)
	    ),
	    this.transform.joinProperty(
		"dataset",
		"authorid",
		(id) => this.toProperty(
		    id, new Uri("https://schema.org/author")
		)
	    ),
	    this.transform.joinProperty(
		"authorid",
		"author",
		(id) => this.toProperty(id, LABEL)
	    ),
	    this.transform.joinPropertyArray(
		"dataset",
		"keywords",
		(id) => this.toProperty(
		    id, new Uri("https://schema.org/keywords")
		)
	    ),
	    map(qr => qr.data),

	)
    }

    // FIXME: Injectable in a non-read-only store
    tagQuery(tag : string) {

	const qry = 'PREFIX schema: <https://schema.org/> SELECT DISTINCT ?s WHERE { ?s a schema:Dataset . ?s schema:keywords "' + tag + '" . } LIMIT 40';

	return new RawQuery(
	    "Keyword search " + tag, qry
	).run(
	    this.query
	).pipe(
	    this.transform.addConstantColumn("p", IS_A),
	    this.transform.addConstantColumn("o", DATASET),
	    this.transform.queryResultToTriples(),
	);

    }

    textSearchResults = 100;

    textSearch(text : string) {

	return new TextSearchQuery(
	    "Search " + text,
	    text,
	    this.textSearchResults,
	).run(
	    this.query
	).pipe(
	    this.joinLabel("s", "slabel"),
	    this.joinLabel("p", "plabel"),
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

    singlePropertyQuery(id : Uri, pred : Uri) {
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

