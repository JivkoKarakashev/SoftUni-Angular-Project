import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormControlName, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { Gym } from 'src/app/types/gym';
import { Running } from 'src/app/types/running';
import { SkiSnowboard } from 'src/app/types/skiSnowboard';
import { SwimSurf } from 'src/app/types/swimSurf';
import { Outdoors } from 'src/app/types/outdoors';
import { BottomsLeggings } from 'src/app/types/bottomsLeggings';
import { Sweater } from 'src/app/types/sweater';
import { BlazerJacket } from 'src/app/types/blazerJacket';
import { Waistcoat } from 'src/app/types/waistcoat';
import { TuxedoPartywear } from 'src/app/types/tuxedoPartywear';
import { Tie } from 'src/app/types/tie';
import { CapHat } from 'src/app/types/capHat';
import { Belt } from 'src/app/types/belt';
import { Glove } from 'src/app/types/glove';
import { Sunglasses } from 'src/app/types/sunglasses';
import { Watch } from 'src/app/types/watch';
import { Trainers } from 'src/app/types/trainers';
import { Boot } from 'src/app/types/boot';
import { Slippers } from 'src/app/types/slippers';
import { Jacket } from 'src/app/types/jacket';
import { Longwear } from 'src/app/types/longwear';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  public item$: Jacket | Longwear |
  Trainers | Boot | Slippers |
  CapHat | Belt | Glove | Sunglasses | Watch |
  Gym | Running | SkiSnowboard | SwimSurf | Outdoors | BottomsLeggings | Sweater |
  BlazerJacket | Waistcoat | TuxedoPartywear | Tie | undefined;
  private unsubscriptionArray: Subscription[] = [];
  private itemSubscription: Subscription = new Subscription;
  private spanElementsSubscription: Subscription = new Subscription;
  public defImgOpacity = 1;

  public form: FormGroup = this.fb.group({
    fgItem: this.fb.group({}),
    selectedColor: ['', /*[Validators.required]*/],
    selectedSize: ['', /*[Validators.required]*/],
    shipping: ['', /*[Validators.required]*/],
    discount: ['', /*[Validators.required]*/],
  });

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private http: HttpClient, private router: Router, private render: Renderer2) { }

  @ViewChildren('imgElements') private imgElements!: QueryList<ElementRef>;
  @ViewChildren('spanColorElements') private spanColorElements!: QueryList<ElementRef>;

  get itemCtrlsGr() {
    return this.form.get("fgItem") as FormGroup;
  }
  get itemCtrlsArr() {
    return this.form.get("fgItem") as FormArray;
  }
  get selectedColor() {
    return this.form.controls["selectedColor"];
  }
  get selectedSize() {
    return this.form.controls["selectedSize"];
  }
  // get altImgsArr() :string[]{
  //   console.log(this.form.controls["fgItem"].get('altImages')?.value);
  //   return this.form.controls["fgItem"].get('altImages')?.value;
  // }
  // get colsArr() :string[]{
  //   console.log(this.form.controls["fgItem"].get('color')?.value);
  //   return this.form.controls["fgItem"].get('color')?.value;
  // }
  get shipping() {
    return this.form.controls["shipping"] as AbstractControl;
  }

  ngOnInit(): void {
    const regExp = /^\/catalog\/[a-z]+_?[a-z]+\/[a-z]+_?[a-z]+/g;
    let match: string[] | null = this.router.url.match(regExp);
    // console.log(this.router.url);
    // console.log(match);
    let url: string = '';
    if (match) {
      url = match[0].split('/')[3];
      // console.log(url);
    }
    const { id } = this.route.snapshot.params;
    // console.log(id);
    this.itemSubscription = this.getItem(url, id).subscribe(itm => {
      this.item$ = itm;
      // console.log(itm);
      // console.log(this.item$);
      const propsArr = Object.entries(itm);
      // console.log(propsArr);
      propsArr.forEach(([k, v]) => {
        (this.form.get('fgItem') as FormGroup).addControl(k, new FormControl(v, Validators.required));
      });
    });
    this.unsubscriptionArray.push(this.itemSubscription);
  }

  ngAfterViewInit(): void {
    // console.log(this.spanCol);
    // console.log(this.img);
    this.spanElementsSubscription = this.spanColorElements.changes.subscribe((els: QueryList<ElementRef>) => {
      // console.log(els.length);
      // els.forEach(el => {
      //   console.log(el.nativeElement);
      // });
      els.forEach((el, i) => {
        // console.log(el.nativeElement);
        // console.log(this.itemCtrlsArr.get('color')?.value[i]);
        this.render.setStyle(el.nativeElement, 'background-color', this.itemCtrlsArr.get('color')?.value[i]);
      });
    });
    this.unsubscriptionArray.push(this.spanElementsSubscription);
  }

  ngOnDestroy(): void {
    // this.itemSubscription.unsubscribe();
    this.unsubscriptionArray.forEach((subscription) => {
      subscription.unsubscribe();
      // console.log('UnsubArray = 1');      
    });
    // console.log('UnsubArray = 2');
  }

  private getItem(url: string, id: string) {
    return this.http.get<
    Jacket | Longwear |
    Trainers | Boot | Slippers |
    CapHat | Belt | Glove | Sunglasses | Watch |
    Gym | Running | SkiSnowboard | SwimSurf | Outdoors | BottomsLeggings | Sweater |
      BlazerJacket | Waistcoat | TuxedoPartywear | Tie
    >(`http://localhost:3030/jsonstore/${url}/${id}`);
  }

  public selectSize(e: Event): void {
    this.form.get('selectedSize')?.value;
    // this.itm.patchValue({selectedSize: this.selectedSize.value});
    const el = e.target as HTMLSelectElement;
    // const size = el.options[el.selectedIndex].text;
    const size = el.value;
    // this.fgItem.controls[i].get('selectedSize')?.patchValue(size);
    // this.fgItem.controls[i].patchValue({ selectedSize: size });
    // console.log(this.fgItem.value);
    // console.log(this.fgItem.controls[i]);
    // console.log(i);
    // console.log(this.selectedSize);
    // console.log(this.fgItem.controls[i].get('selectedSize')?.value);
    // console.log(this.fgItem.controls[i].get('size')?.value);
  }

  public selectColor(): void {
    // console.log(this.selectedColor.value);
    if (this.itemCtrlsGr.get('selectedColor')?.value == undefined) {
      this.itemCtrlsGr.addControl('selectedColor', new FormControl(this.selectedColor, Validators.required));
    }
    this.itemCtrlsGr.get('selectedColor')?.patchValue(this.selectedColor.value);

    this.imgElements.forEach(el => {
      // console.log(el.nativeElement.dataset['image']);
      // console.log(this.selectedColor.value);
      if(el.nativeElement.dataset['image'] == this.selectedColor.value) {
        this.defImgOpacity = 0;
        el.nativeElement.classList.contains('active') ? null : this.render.addClass(el.nativeElement, 'active');
      } else {
        el.nativeElement.classList.contains('active') ? this.render.removeClass(el.nativeElement, 'active') : null;
      }
    });
  }

  public trackByUrl(index: number, url: any): string {
    // console.log(url);
    return url;
  }

  public purchase(): void {
    // console.log(this.itms);
    console.log(this.form.value);
    console.log(this.selectedColor?.value);
    console.log(this.selectedSize?.value);
  }

}
