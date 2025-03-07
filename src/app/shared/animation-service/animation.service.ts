import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  private catalogItemEnterLeaveAnimationDisabled$$ = new BehaviorSubject<boolean>(true);
  private catalogItemEnterLeaveAnimationDisabled$ = this.catalogItemEnterLeaveAnimationDisabled$$.asObservable();

  getCatalogItemAnimationState(): Observable<boolean> {
    return this.catalogItemEnterLeaveAnimationDisabled$;
  }

  disableCatalogItemEnterLeaveAnimation(): void {
    this.catalogItemEnterLeaveAnimationDisabled$$.next(true);
  }

  enableCatalogItemEnterLeaveAnimation(): void {
    this.catalogItemEnterLeaveAnimationDisabled$$.next(false);
  }
}
