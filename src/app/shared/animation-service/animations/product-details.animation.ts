import { animate, animateChild, group, keyframes, query, style, transition, trigger } from "@angular/animations";

export type CarouselImageUrl = string;

export const detailsDeleteAnimation = trigger('detailsDeleteAnimation', [
    transition('static => delete', [
        query('@carouselMoveAnimation', animateChild(),
            { optional: true }
        ),
        query(':self', [
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
                        width: 0,
                        minWidth: 0,
                        transform: 'scale(0)',
                        opacity: 0,
                        padding: 0,
                        margin: 0,
                        offset: 1
                    }),

                ])
            ),
        ], { optional: true })
    ]),
    transition('delete => void', [
        animate('0.001s ease-in', style({ opacity: 0 }))
    ])
]);

export const carouselMoveAnimation = trigger('carouselMoveAnimation', [
    transition('* <=> *', [
        group([
            query(':enter', [
                style({
                    transform: 'translateX({{ enterStart }}) scale(0.25)',
                    opacity: 0
                }),
                animate('.3s ease-in-out',
                    style({
                        transform: 'translateX(0) scale(1)',
                        opacity: 1
                    })
                )
            ], { optional: true }),
            query(':leave', [
                animate('.3s ease-in-out',
                    style({
                        transform: 'translateX({{ leaveEnd }}) scale(0.25)',
                        opacity: 0
                    })
                )
            ], { optional: true }),
        ]),
    ],
        {
            params: {
                leaveEnd: '',
                enterStart: ''
            }
        }
    )
]);
