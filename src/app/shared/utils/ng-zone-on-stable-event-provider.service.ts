import { EventEmitter, Injectable, NgZone } from '@angular/core';
import { Observable, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NgZoneOnStableEventProviderService {

  constructor(
    protected ngZone: NgZone
  ) { }

  ngZoneOnStableEvent(): Observable<EventEmitter<void>> {
    return this.ngZone.onStable.pipe(take(1));
  }
}
