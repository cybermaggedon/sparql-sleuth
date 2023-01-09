import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject, retry, mergeMap } from 'rxjs';

import { MessageService } from './message.service';
import { ProgressService } from './progress.service';

const CONFIG_PATH = "/assets/config.json";

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
	private message : MessageService,
    ) {

	this.progress.add("Loading config");

	this.httpClient.get<any>(
	    CONFIG_PATH
	).pipe(
	    retry(3),
	).subscribe({
	    next: config => {
		this.progress.delete("Loading config");
		// FIXME: Is a race condition here?
		this.config = config;
		this.loaded = true;
		this.loadComplete.next();
	    },
	    error: (err) => {
		this.message.error(err);
		this.progress.delete("Loading config");
		this.config = this.defaultConfig
		this.loaded = true;
		this.loadComplete.next();
	    },
	    complete: () => {}
	});

    }

    defaultConfig: any = {
	"sparql-url": "/sparql",
	"gallery": []
    };

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

