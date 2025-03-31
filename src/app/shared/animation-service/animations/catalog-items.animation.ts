import { animate, animateChild, group, keyframes, query, sequence, stagger, style, transition, trigger } from "@angular/animations";

export type CatalogItemAnimationState = 'static' | 'enter' | 'leave' | 'delete' | 'filter';

export interface AddToCartButtonAnimationState {
    animateState: 'static' | 'animate',
    btnText: 'Add to Cart' | '' | string
}

export const catalogItemEnterLeaveAnimation = trigger('catalogItemEnterLeaveAnimation', [
    transition('void => static, filter => static', [
        query(':enter.item', [
            style({ opacity: 0, transform: 'scale(.7)' }),
            stagger(10, [
                animate('.2s ease-in',
                    style({
                        opacity: 1,
                        transform: 'scale(1)'
                    })
                )
            ])
        ], { optional: true })
    ]),
    transition('static => leave, static => filter', [
        query('@catalogItemDeleteAnimation', animateChild(),
            { optional: true }
        ),
        query(':leave', [
            style({ opacity: 1, transform: 'scale(1)' }),
            stagger(-10, [
                animate('.2s ease-in',
                    style({
                        opacity: 0,
                        transform: 'scale(.7)'
                    })
                )
            ])
        ], { optional: true }),
    ]),
    transition('leave => void', [
        animate('0.001s ease-in', style({ opacity: 0 }))
    ])
]);

export const catalogItemDeleteAnimation = trigger('catalogItemDeleteAnimation', [
    transition('static => delete', [
        sequence([
            style({ opacity: 0 }),
            animate('1s ease-out',
                keyframes([
                    style({
                        transform: 'scale(1)',
                        width: '250px',
                        minWidth: '250px',
                        opacity: 1,
                        transformOrigin: '125px 125px',
                        offset: 0
                    }),
                    style({
                        transform: 'scale(0)',
                        opacity: 0,
                        offset: .5
                    }),
                    style({
                        width: '250px',
                        minWidth: '250px',
                        transform: 'scale(0)',
                        opacity: 0,
                        padding: 0,
                        margin: 0,
                        offset: 1
                    }),

                ])
            ),
        ])
    ]),
    transition('static => void', [
        animate('0.001s ease-in', style({ opacity: 0 }))
    ])
]);

export const addToCartButtonAnimation = trigger('addToCartButtonAnimation', [
    transition('static => animate', [
        group([
            query('.buy', [
                animate('1s',
                    keyframes([
                        style({
                            height: '2.9em',
                            width: '2.9em',
                            fontWeight: '900',
                            color: '#5cb85c',
                            backgroundColor: '#fff',
                            border: '3px solid #bbb',
                            borderRadius: '50%',
                            borderLeftColor: '#5cb85c',
                            offset: .001
                        }),
                        style({
                            color: '#fff',
                            backgroundColor: '#5cb85c',
                            transform: 'rotate(360deg)',
                            offset: 1
                        }),
                    ])
                )
            ], { optional: true }),
            query('span.btn-text', [
                animate('1s',
                    keyframes([
                        style({
                            transform: 'rotate(-360deg)',
                            offset: 1
                        }),
                    ])
                )
            ], { optional: true }),
        ])
    ])
]);

