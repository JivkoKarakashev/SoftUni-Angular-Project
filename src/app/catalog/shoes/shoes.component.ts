import { Component, OnInit, Renderer2 } from '@angular/core';
import { ShoesService } from 'src/app/shoes.service';
import { Shoes } from 'src/app/types/shoes';

@Component({
  selector: 'app-shoes',
  templateUrl: './shoes.component.html',
  styleUrls: ['./shoes.component.css']
})
export class ShoesComponent implements OnInit {
  public listItems$: Shoes[] = [];

  constructor(private render: Renderer2, private shoesService: ShoesService) { }

  ngOnInit(): void {
    this.shoesService.getShoes().subscribe(shoes => {
      this.listItems$ = shoes;
    });
  }
}
