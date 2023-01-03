import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject, retry, mergeMap } from 'rxjs';

import { ProgressService } from './progress.service';

export interface GalleryConfigurationItem {
    title : string;
    description : string;
    keywords : string[];
    graph : string;
    image : string;
};

@Injectable({
    providedIn: 'root'
})
export class ConfigService {

    constructor(
	private httpClient : HttpClient,
	private progress : ProgressService,
    ) {

	this.progress.add("Loading config");

	this.httpClient.get<any>(
	    "/assets/config.json"
	).pipe(
	    retry(3),
	).subscribe(
	    config => {

		this.progress.delete("Loading config");

		// FIXME: Is a race condition here?
		this.config = config;
		this.loaded = true;
		this.loadComplete.next();

	    }
	);

    }

    loadComplete = new Subject<void>();
    loaded = false;
    config : any = {}

    getConfig(key : string) : Observable<any> {
	if (this.loaded) {
	    return of(this.config[key]);
	} else {
	    return this.loadComplete.pipe(
		mergeMap(
		    () => {
			return this.getConfig(key);
		    }
		)
	    );
	}
    }

    getSparqlUrl() {
	return this.getConfig("sparql-url");
    }

    getGallery() : Observable<GalleryConfigurationItem[]> {
	return this.getConfig("gallery");
    }

}

