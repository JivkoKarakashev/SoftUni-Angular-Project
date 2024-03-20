import { ApplicationRef, Component, ElementRef, OnInit, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ShoppingCartService } from 'src/app/shared/shopping-cart.service';
import { ShoesService } from 'src/app/shoes.service';
import { Item } from 'src/app/types/item';
import { Shoes } from 'src/app/types/shoes';

@Component({
  selector: 'app-shoes',
  templateUrl: './shoes.component.html',
  styleUrls: ['./shoes.component.css']
})
export class ShoesComponent implements OnInit {
  public listItems$: Shoes[] = [];
  private cartItms$$ = new BehaviorSubject<Item[]>([]);
  public cartItms$ = this.cartItms$$.asObservable();

  constructor(private render: Renderer2, private shoesService: ShoesService, private cartService: ShoppingCartService, private appRef: ApplicationRef) { }

  @ViewChildren('buyBtn') private buyBtn!: QueryList<ElementRef>;

  ngOnInit(): void {
    this.shoesService.getShoes().subscribe(shoes => {
      // console.log(shoes[0].buyed);
      // this.listItems$ = Object.values(shoes);
      // console.log(Object.values(shoes));
      this.listItems$ = shoes;
    });

    this.cartService.items$.subscribe(items => {
      this.cartItms$$.next([...items])
      // this.cartItms$ = items;
    });
  }

  addItemtoCart(e: Event, item: Shoes) {
    // console.log(e.target);
    item.buyed = true;
    const { _ownerId, _id, image, description, color, quantity, price } = item;
    const el = e.target as HTMLSelectElement;
    // console.log(item._id);
    const idx = this.listItems$.findIndex(itm => itm._id == _id);
    this.listItems$.splice(idx, 1, item );    
    this.cartService.addCartItem({ _ownerId, _id, image, description, color, quantity, price });      
    // console.log(this.cartItms$);
    // console.log(this.listItems$);
    // console.log(this.cartItms$$.value);
  }
}
