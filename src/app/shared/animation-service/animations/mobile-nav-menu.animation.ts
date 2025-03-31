import { animate, group, query, style, transition, trigger } from "@angular/animations";

export const mobileNavMenuAnimation = trigger('mobileNavMenuAnimation', [
    transition('closed => open, navigate => open', [
        group([
            query(':self', [
                style({
                    transform: 'translateX(120%)'
                }),
                animate('.5s ease-in',
                    style({
                        transform: 'translateX(0)'
                    }),
                )
            ], { optional: true }),
        ])
    ]),
    transition('open => closed, open => navigate', [
        group([
            query(':self', [
                style({
                    transform: 'translateX(0)'
                }),
                animate('.5s ease-in',
                    style({
                        transform: 'translateX(120%)'
                    }),
                )
            ], { optional: true })
        ])
    ])

]);