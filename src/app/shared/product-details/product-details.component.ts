import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    const { id } = this.route.snapshot.params;
    // console.log(id);
  }

  ngOnDestroy(): void {

  }
}
