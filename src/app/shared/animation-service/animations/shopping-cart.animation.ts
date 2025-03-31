import { animate, group, query, style, transition, trigger } from "@angular/animations";

export type ShoppingCartAnimationState = 'enter' | 'leave' | 'none';

export const shoppingCartLeaveAnimation = trigger('shoppingCartLeaveAnimation', [
    transition('enter => leave', [
        group([
            query(':leave', [
                animate('.5s',
                    style({
                        transform: 'translateY(-300px)',
                        opacity: 0
                    })
                )
            ], { optional: true }),
            query('.modal-content', [
                animate('.5s',
                    style({
                        transform: 'translateY(-300px)',
                        opacity: 0
                    })
                )
            ], { optional: true }),
        ])
    ]),
    transition('leave => void', [
        animate('0.001s', style({ 
            opacity: 0,
            // visibility: 'hidden'
         }))
    ])
]);