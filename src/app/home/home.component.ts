import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import config from '../config/carouselSlideConfig';
import { HomeService } from './home.service';
import { ShoppingCartService } from '../shared/shopping-cart.service';
import { CartItem } from '../types/cartItem';

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
import { Gym } from '../types/gym';
import { Running } from '../types/running';
import { SkiSnowboard } from '../types/skiSnowboard';
import { SwimSurf } from '../types/swimSurf';
import { Outdoors } from '../types/outdoors';
import { BottomsLeggings } from '../types/bottomsLeggings';
import { Sweater } from '../types/sweater';
import { BlazerJacket } from '../types/blazerJacket';
import { Waistcoat } from '../types/waistcoat';
import { TuxedoPartywear } from '../types/tuxedoPartywear';
import { Tie } from '../types/tie';

interface slideImg {
  img: string,
  cat: string,
  subCat: string,
  id: string
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  public recentTwoClothes$: (Jacket | Longwear)[] = [];
  public recentTwoShoes$: (Trainers | Boot | Slippers)[] = [];
  public recentTwoAccessories$: (CapHat | Belt | Glove | Sunglasses | Watch)[] = [];
  public recentTwoSportswear$: (Gym | Running | SkiSnowboard | SwimSurf | Outdoors | BottomsLeggings | Sweater)[] = [];
  public recentTwoSuits_tailoring$: (BlazerJacket | Waistcoat | TuxedoPartywear | Tie)[] = [];
  private cartItms$$ = new BehaviorSubject<CartItem[]>([]);
  public buyedItems: number = 0;
  private unsubscriptionArray: Subscription[] = [];
  public loading: boolean = true;

  public clothesSlides: slideImg[] = [];
  public shoesSlides: slideImg[] = [];
  public accessoriesSlides: slideImg[] = [];
  public sportswearSlides: slideImg[] = [];
  public suits_tailoringSlides: slideImg[] = [];
  public slideConfig = config;

  constructor(private homeService: HomeService, private cartService: ShoppingCartService) { }

  ngOnInit(): void {
    const recentTwoItemsSubscription = this.homeService.getRecentTwoItems().subscribe(recentTwoObjs => {
      this.loading = false;
      let [
        recentTwoJacketsObjs, recentTwoLongwearObjs,
        recentTwoTrainersObjs, recentTwoBootsObjs, recentTwoSlippersObjs,
        recentTwoCaps_hatsObjs, recentTwoBeltsObjs, recentTwoGlovesObjs, recentTwoSunglassesObjs, recentTwoWatchesObjs,
        recentTwoGymObjs, recentTwoRunningObjs, recentTwoSki_snowboardObjs, recentTwoSwim_surfObjs, recentTwoOutdoorsObjs, recentTwoBottoms_leggingsObjs, recentTwoSweatersObjs,
        recentTwoBlazers_jacketsObjs, recentTwoWaistcoatsObjs, recentTwoTuxedos_partywearObjs, recentTwoTiesObjs
      ] = recentTwoObjs;
      const recentTwoJackets = Object.entries(recentTwoJacketsObjs).map(recentTwoJckt => recentTwoJckt[1]);
      recentTwoJackets.forEach(jckt => {
        this.clothesSlides.push({ img: jckt.image, cat: jckt.cat, subCat: jckt.subCat, id: jckt._id });
      });
      const recentTwoLongwear = Object.entries(recentTwoLongwearObjs).map(recentLngwear => recentLngwear[1]);
      recentTwoLongwear.forEach(lngwr => {
        this.clothesSlides.push({ img: lngwr.image, cat: lngwr.cat, subCat: lngwr.subCat, id: lngwr._id });
      });
      const recentTwoTrainers = Object.entries(recentTwoTrainersObjs).map(recentTrainers => recentTrainers[1]);
      recentTwoTrainers.forEach(tr => {
        this.shoesSlides.push({ img: tr.image, cat: tr.cat, subCat: tr.subCat, id: tr._id });
      });
      const recentTwoBoots = Object.entries(recentTwoBootsObjs).map(recentBoots => recentBoots[1]);
      recentTwoBoots.forEach(bts => {
        this.shoesSlides.push({ img: bts.image, cat: bts.cat, subCat: bts.subCat, id: bts._id });
      });
      const recentTwoSlippers = Object.entries(recentTwoSlippersObjs).map(recentSlippers => recentSlippers[1]);
      recentTwoSlippers.forEach(slps => {
        this.shoesSlides.push({ img: slps.image, cat: slps.cat, subCat: slps.subCat, id: slps._id });
      });
      const recentTwoCaps_hats = Object.entries(recentTwoCaps_hatsObjs).map(recentCap_hat => recentCap_hat[1]);
      recentTwoCaps_hats.forEach(cp_ht => {
        this.accessoriesSlides.push({ img: cp_ht.image, cat: cp_ht.cat, subCat: cp_ht.subCat, id: cp_ht._id });
      });
      const recentTwoBelts = Object.entries(recentTwoBeltsObjs).map(recentBelt => recentBelt[1]);
      recentTwoBelts.forEach(blt => {
        this.accessoriesSlides.push({ img: blt.image, cat: blt.cat, subCat: blt.subCat, id: blt._id });
      });
      const recentTwoGloves = Object.entries(recentTwoGlovesObjs).map(recentGlves => recentGlves[1]);
      recentTwoGloves.forEach(glvs => {
        this.accessoriesSlides.push({ img: glvs.image, cat: glvs.cat, subCat: glvs.subCat, id: glvs._id });
      });
      const recentTwoSunglasses = Object.entries(recentTwoSunglassesObjs).map(recentSnglsses => recentSnglsses[1]);
      recentTwoSunglasses.forEach(snglsses => {
        this.accessoriesSlides.push({ img: snglsses.image, cat: snglsses.cat, subCat: snglsses.subCat, id: snglsses._id });
      });
      const recentTwoWatches = Object.entries(recentTwoWatchesObjs).map(recentWtch => recentWtch[1]);
      recentTwoWatches.forEach(wtch => {
        this.accessoriesSlides.push({ img: wtch.image, cat: wtch.cat, subCat: wtch.subCat, id: wtch._id });
      });
      const recentTwoGym = Object.entries(recentTwoGymObjs).map(recentGm => recentGm[1]);
      recentTwoGym.forEach(gm => {
        this.sportswearSlides.push({ img: gm.image, cat: gm.cat, subCat: gm.subCat, id: gm._id });
      });
      const recentTwoRunnings = Object.entries(recentTwoRunningObjs).map(recentRun => recentRun[1]);
      recentTwoRunnings.forEach(run => {
        this.sportswearSlides.push({ img: run.image, cat: run.cat, subCat: run.subCat, id: run._id });
      });
      const recentTwoSki_snowboard = Object.entries(recentTwoSki_snowboardObjs).map(recentSk_snwbrd => recentSk_snwbrd[1]);
      recentTwoSki_snowboard.forEach(ski_snwbrd => {
        this.sportswearSlides.push({ img: ski_snwbrd.image, cat: ski_snwbrd.cat, subCat: ski_snwbrd.subCat, id: ski_snwbrd._id });
      });
      const recentTwoSwim_surf = Object.entries(recentTwoSwim_surfObjs).map(recentSwm_srf => recentSwm_srf[1]);
      recentTwoSwim_surf.forEach(swim_srf => {
        this.sportswearSlides.push({ img: swim_srf.image, cat: swim_srf.cat, subCat: swim_srf.subCat, id: swim_srf._id });
      });
      const recentTwoOutdoors = Object.entries(recentTwoOutdoorsObjs).map(recentOutdr => recentOutdr[1]);
      recentTwoOutdoors.forEach(outdr => {
        this.sportswearSlides.push({ img: outdr.image, cat: outdr.cat, subCat: outdr.subCat, id: outdr._id });
      });
      const recentTwoBottoms_leggings = Object.entries(recentTwoBottoms_leggingsObjs).map(recentBtm_leg => recentBtm_leg[1]);
      recentTwoBottoms_leggings.forEach(btm_leg => {
        this.sportswearSlides.push({ img: btm_leg.image, cat: btm_leg.cat, subCat: btm_leg.subCat, id: btm_leg._id });
      });
      const recentTwoSweaters = Object.entries(recentTwoSweatersObjs).map(recentSwtr => recentSwtr[1]);
      recentTwoSweaters.forEach(swtr => {
        this.sportswearSlides.push({ img: swtr.image, cat: swtr.cat, subCat: swtr.subCat, id: swtr._id });
      });
      const recentTwoBlazers_jackets = Object.entries(recentTwoBlazers_jacketsObjs).map(recentBlzr_jckt => recentBlzr_jckt[1]);
      recentTwoBlazers_jackets.forEach(blzr_jckt => {
        this.suits_tailoringSlides.push({ img: blzr_jckt.image, cat: blzr_jckt.cat, subCat: blzr_jckt.subCat, id: blzr_jckt._id });
      });
      const recentTwoWaistcoats = Object.entries(recentTwoWaistcoatsObjs).map(recentWstct => recentWstct[1]);
      recentTwoWaistcoats.forEach(wstct => {
        this.suits_tailoringSlides.push({ img: wstct.image, cat: wstct.cat, subCat: wstct.subCat, id: wstct._id });
      });
      const recentTwoTuxedos_partywear = Object.entries(recentTwoTuxedos_partywearObjs).map(recentTxd_ptywr => recentTxd_ptywr[1]);
      recentTwoTuxedos_partywear.forEach(txd_ptywr => {
        this.suits_tailoringSlides.push({ img: txd_ptywr.image, cat: txd_ptywr.cat, subCat: txd_ptywr.subCat, id: txd_ptywr._id });
      });
      const recentTwoTies = Object.entries(recentTwoTiesObjs).map(recentTie => recentTie[1]);
      recentTwoTies.forEach(tie => {
        this.suits_tailoringSlides.push({ img: tie.image, cat: tie.cat, subCat: tie.subCat, id: tie._id });
      });
      // console.log(this.suits_tailoringSlides);
      // console.log(this.clothesSlides);
      this.recentTwoClothes$ = [...this.recentTwoClothes$, ...recentTwoJackets, ...recentTwoLongwear];
      this.recentTwoShoes$ = [...this.recentTwoShoes$, ...recentTwoTrainers, ...recentTwoBoots, ...recentTwoSlippers];
      this.recentTwoAccessories$ = [...this.recentTwoAccessories$, ...recentTwoCaps_hats, ...recentTwoBelts, ...recentTwoGloves, ...recentTwoSunglasses, ...recentTwoWatches];
      this.recentTwoSportswear$ = [...this.recentTwoSportswear$, ...recentTwoGym, ...recentTwoRunnings, ...recentTwoSki_snowboard, ...recentTwoSwim_surf, ...recentTwoOutdoors, ...recentTwoBottoms_leggings, ...recentTwoSweaters];
      this.recentTwoSuits_tailoring$ = [...this.recentTwoSuits_tailoring$ ,...recentTwoBlazers_jackets, ...recentTwoWaistcoats, ...recentTwoTuxedos_partywear, ...recentTwoTies];
      // console.log(this.recentTwoShoes$);
      // console.log(recentTwoGymObjs);
    });
    // console.log(this.suits_tailoringSlides);

    const cartSubscription = this.cartService.getCartItems().subscribe(items => {
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
