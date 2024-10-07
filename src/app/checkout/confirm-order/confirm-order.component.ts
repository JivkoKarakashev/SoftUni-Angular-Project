import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { ConfirmOrderService } from './confirm-order.service';
import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';

@Component({
  selector: 'app-confirm-order',
  templateUrl: './confirm-order.component.html',
  styleUrls: ['./confirm-order.component.css']
})
export class ConfirmOrderComponent implements OnInit, OnDestroy {
  private unsubscriptionArray: Subscription[] = [];
  public loading = true;
  private session_id = '';
  public session_status$: string | null = null;
  public customer_email$: string | null = null;

  constructor(private activeRoute: ActivatedRoute, private confirmOrderService: ConfirmOrderService, private router: Router, private cartService: ShoppingCartService) { }

  ngOnInit(): void {
    const queryParamsSubscription = this.activeRoute.queryParams.subscribe(params => {
      this.session_id = params['session_id'] || '';
      // console.log(this.session_id);
    });
    this.unsubscriptionArray.push(queryParamsSubscription);
    if (this.session_id) {
      const sessionStatusSubscription = this.confirmOrderService.getSessionStatus(this.session_id).subscribe(sessionStatus => {
        this.loading = false;
        const { status, customer_email } = sessionStatus;
        this.session_status$ = status || '';
        this.customer_email$ = customer_email;
        // console.log(status);
        // console.log(customer_email);
        if (this.session_status$ == 'open') {
          console.log('SESSION STATUS: OPEN!!');
          this.router.navigate(['/checkout']);
        } else if (this.session_status$ == 'complete') {
          console.log('SESSION STATUS: COMPLETE!!');
          this.cartService.emptyCart();
        }
      });
      this.unsubscriptionArray.push(sessionStatusSubscription);
    }
  }

  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 1');      
    });
  }
}