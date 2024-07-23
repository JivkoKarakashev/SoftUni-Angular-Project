import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import config from '../config/carouselSlideConfig';
import { HomeService } from './home.service';
import { Jacket } from '../types/jacket';
import { Longwear } from '../types/longwear';
import { Trainers } from '../types/trainers';
import { Boot } from '../types/boot';
import { Slippers } from '../types/slippers';
import { CapHat } from '../types/capHat';
import { Belt } from '../types/belt';
import { Glove } from '../types/glove';
import { Sunglasses } from '../types/sunglasses';
import { Watch } from '../types/watch';

import { ShoppingCartService } from '../shared/shopping-cart.service';
import { Item } from '../types/item';
import { Gym } from '../types/gym';
import { Running } from '../types/running';
import { SkiSnowboard } from '../types/skiSnowboard';
import { SwimSurf } from '../types/swimSurf';
import { Outdoors } from '../types/outdoors';
import { BottomsLeggings } from '../types/bottomsLeggings';
import { Sweater } from '../types/sweater';
import { BlazerJacket } from '../types/blazerJacket';

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
  public recentTwoShoes$: (Trainers & Boot & Slippers)[] = [];
  public recentTwoAccessories$: (CapHat & Belt & Glove & Sunglasses & Watch)[] = [];
  public recentTwoSportswear$: (Gym & Running & SkiSnowboard & SwimSurf & Outdoors & BottomsLeggings & Sweater)[] = [];
  public recentTwoSuits_tailoring$: (BlazerJacket)[] = [];
  private cartItms$$ = new BehaviorSubject<Item[]>([]);
  public cartItms$ = this.cartItms$$.asObservable();
  public buyedItems: number = 0;
  private unsubscriptionArray: Subscription[] = [];
  public loading: boolean = true;
  
  public clothesSlides: slideImg [] = [];
  public shoesSlides: slideImg [] = [];
  public accessoriesSlides: slideImg [] = [];
  public sportswearSlides: slideImg [] = [];
  public suits_tailoringSlides: slideImg [] = [];
  public slideConfig = config;

  constructor(private homeService: HomeService, private cartService: ShoppingCartService) {}

  ngOnInit(): void {
    const recentTwoItemsSubscription = this.homeService.getRecentTwoItems().subscribe(recentTwoObjs => {
      this.loading = false;
      let [
        recentTwoJacketsObjs, recentTwoLongwearObjs,
        recentTwoTrainersObjs, recentTwoBootsObjs, recentTwoSlippersObjs,
        recentTwoCaps_hatsObjs, recentTwoBeltsObjs, recentTwoGlovesObjs, recentTwoSunglassesObjs, recentTwoWatchesObjs,
        recentTwoGymObjs, recentTwoRunningObjs, recentTwoSki_snowboardObjs, recentTwoSwim_surfObjs, recentTwoOutdoorsObjs, recentTwoBottoms_leggingsObjs, recentTwoSweatersObjs,
        recentTwoBlazers_jacketsObjs
      ] = recentTwoObjs
      const recentTwoJackets = Object.entries(recentTwoJacketsObjs).map(recentTwoJckt => recentTwoJckt[1]);
      recentTwoJackets.forEach(jckt => {
        this.clothesSlides.push({ img: jckt.image, id: jckt._id });
      });
      const recentTwoLongwear = Object.entries(recentTwoLongwearObjs).map(recentLngwear => recentLngwear[1]);
      recentTwoLongwear.forEach(lngwr => {
        this.clothesSlides.push({ img: lngwr.image, id: lngwr._id });
      });
      const recentTwoTrainers = Object.entries(recentTwoTrainersObjs).map(recentTrainers => recentTrainers[1]);
      recentTwoTrainers.forEach(tr => {
        this.shoesSlides.push({ img: tr.image, id: tr._id });
      });
      const recentTwoBoots = Object.entries(recentTwoBootsObjs).map(recentBoots => recentBoots[1]);
      recentTwoBoots.forEach(bts => {
        this.shoesSlides.push({ img: bts.image, id: bts._id });
      });
      const recentTwoSlippers = Object.entries(recentTwoSlippersObjs).map(recentSlippers => recentSlippers[1]);
      recentTwoSlippers.forEach(slps => {
        this.shoesSlides.push({ img: slps.image, id: slps._id });
      });
      const recentTwoCaps_hats = Object.entries(recentTwoCaps_hatsObjs).map(recentCap_hat => recentCap_hat[1]);
      recentTwoCaps_hats.forEach(cp_ht => {
        this.accessoriesSlides.push({ img: cp_ht.image, id: cp_ht._id });
      });
      const recentTwoBelts = Object.entries(recentTwoBeltsObjs).map(recentBelt => recentBelt[1]);
      recentTwoBelts.forEach(blt => {
        this.accessoriesSlides.push({ img: blt.image, id: blt._id });
      });
      const recentTwoGloves = Object.entries(recentTwoGlovesObjs).map(recentGlves => recentGlves[1]);
      recentTwoGloves.forEach(glvs => {
        this.accessoriesSlides.push({ img: glvs.image, id: glvs._id });
      });
      const recentTwoSunglasses = Object.entries(recentTwoSunglassesObjs).map(recentSnglsses => recentSnglsses[1]);
      recentTwoSunglasses.forEach(snglsses => {
        this.accessoriesSlides.push({ img: snglsses.image, id: snglsses._id });
      });
      const recentTwoWatches = Object.entries(recentTwoWatchesObjs).map(recentWtch => recentWtch[1]);
      recentTwoWatches.forEach(wtch => {
        this.accessoriesSlides.push({ img: wtch.image, id: wtch._id });
      });

      const recentTwoGym = Object.entries(recentTwoGymObjs).map(recentGm => recentGm[1]);
      recentTwoGym.forEach(gm => {
        this.sportswearSlides.push({ img: gm.image, id: gm._id });
      });
      const recentTwoRunnings = Object.entries(recentTwoRunningObjs).map(recentRun => recentRun[1]);
      recentTwoRunnings.forEach(run => {
        this.sportswearSlides.push({ img: run.image, id: run._id });
      });
      const recentTwoSki_snowboard = Object.entries(recentTwoSki_snowboardObjs).map(recentSk_snwbrd => recentSk_snwbrd[1]);
      recentTwoSki_snowboard.forEach(ski_snwbrd => {
        this.sportswearSlides.push({ img: ski_snwbrd.image, id: ski_snwbrd._id });
      });
      const recentTwoSwim_surf = Object.entries(recentTwoSwim_surfObjs).map(recentSwm_srf => recentSwm_srf[1]);
      recentTwoSwim_surf.forEach(swim_srf => {
        this.sportswearSlides.push({ img: swim_srf.image, id: swim_srf._id });
      });
      const recentTwoOutdoors = Object.entries(recentTwoOutdoorsObjs).map(recentOutdr => recentOutdr[1]);
      recentTwoOutdoors.forEach(outdr => {
        this.sportswearSlides.push({ img: outdr.image, id: outdr._id });
      });
      const recentTwoBottoms_leggings = Object.entries(recentTwoBottoms_leggingsObjs).map(recentBtm_leg => recentBtm_leg[1]);
      recentTwoBottoms_leggings.forEach(btm_leg => {
        this.sportswearSlides.push({ img: btm_leg.image, id: btm_leg._id });
      });
      const recentTwoSweaters = Object.entries(recentTwoSweatersObjs).map(recentSwtr => recentSwtr[1]);
      recentTwoSweaters.forEach(swtr => {
        this.sportswearSlides.push({ img: swtr.image, id: swtr._id });
      });
      const recentTwoBlazers_jackets = Object.entries(recentTwoBlazers_jacketsObjs).map(recentBlzr_jckt => recentBlzr_jckt[1]);
      recentTwoBlazers_jackets.forEach(blzr_jckt => {
        this.suits_tailoringSlides.push({ img: blzr_jckt.image, id: blzr_jckt._id });
      });
      // console.log(recentTwoJackets);
      // console.log(this.clothesSlides);
      this.recentTwoClothes$ = recentTwoJackets.concat(recentTwoLongwear);
      this.recentTwoShoes$ = recentTwoTrainers.concat(recentTwoBoots, recentTwoSlippers);
      this.recentTwoAccessories$ = recentTwoCaps_hats.concat(recentTwoBelts, recentTwoGloves, recentTwoSunglasses, recentTwoWatches);
      this.recentTwoSportswear$ = recentTwoGym.concat(recentTwoRunnings, recentTwoSki_snowboard, recentTwoSwim_surf, recentTwoOutdoors, recentTwoBottoms_leggings, recentTwoSweaters);
      this.recentTwoSuits_tailoring$ = recentTwoBlazers_jackets.concat([]);
    });

    const cartSubscription = this.cartService.items$.subscribe(items => {
      this.buyedItems = items.length;
      this.cartItms$$.next([...items]);
    });
    this.unsubscriptionArray.push(recentTwoItemsSubscription, cartSubscription);
  }
  
  ngOnDestroy(): void {
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 1');      
    }); 
  }
  
  public trackById(index: number, item: any): string {
    // console.log(item.id);
    return item.id;
  }
}
