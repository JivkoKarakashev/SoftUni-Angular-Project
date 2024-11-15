import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DestroySubsNotifierService {

  private destroy$$: Subject<void> = new Subject<void>;

  constructor() { }

  getNotifier(): Subject<void> {
    return this.destroy$$;
  }
  destroy(): void {
    this.destroy$$.next();
  }
}
