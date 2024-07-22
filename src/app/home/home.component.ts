import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import config from '../config/carouselSlideConfig';
import { HomeService } from './home.service';
import { Jacket } from '../types/jacket';
import { Longwear } from '../types/longwear';

interface slideImg {
  img: string,
  id: string
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  public recentTwoClothes$: (Jacket & Longwear)[] = [];
  private unsubscriptionArray: Subscription[] = [];
  public loading: boolean = true;
  
  clothesSlides: slideImg [] = [];
  slideConfig = config;
  constructor(private homeService: HomeService) {}

  ngOnInit(): void {
    const recentTwoClothesSubscription = this.homeService.getRecentTwoClothes().subscribe(recentTwoObjs => {
      this.loading = false;
      let [recentTwoJacketsObjs, recentTwoLongwearObjs] = recentTwoObjs
      const recentTwoJackets = Object.entries(recentTwoJacketsObjs).map(recentTwoJckt => recentTwoJckt[1]);
      recentTwoJackets.forEach(jckt => {
        this.clothesSlides.push({ img: jckt.image, id: jckt._id });
      });
      const recentTwoLongwear = Object.entries(recentTwoLongwearObjs).map(recentLngwear => recentLngwear[1]);
      recentTwoLongwear.forEach(lngwr => {
        this.clothesSlides.push({ img: lngwr.image, id: lngwr._id });
      });
      // console.log(recentTwoJackets);
      // console.log(recentTwoLongwear);
      // console.log(this.slides);      
      this.recentTwoClothes$ = recentTwoJackets.concat(recentTwoLongwear);
    });
    this.unsubscriptionArray.push(recentTwoClothesSubscription);
  }
  
  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 1');      
    }); 
  }  
}
