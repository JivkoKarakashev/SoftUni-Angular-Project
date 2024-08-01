import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

interface rgbObj {
    r: number,
    g: number,
    b: number
}

@Injectable({
    providedIn: 'root'
})
export class InvertColor {
    private render: Renderer2
    constructor(private renderFactory: RendererFactory2) {
        this.render = this.renderFactory.createRenderer(null, null);
    }

    standardize_color(color: string): rgbObj {
        const canvas = <HTMLCanvasElement>(this.render.createElement('canvas'));
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const rgbData = imgData.slice(0, imgData.length - 1);
        const rgb: rgbObj = { r: rgbData[0], g: rgbData[1], b: rgbData[2] };
        // console.log(rgb);
        return rgb
    }

    invertColor(rgbObj: rgbObj): string {
        // if (hex.indexOf('#') === 0) {
        //     hex = hex.slice(1);
        // }
        // // convert 3-digit hex to 6-digits.
        // if (hex.length === 3) {
        //     hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        // }
        // if (hex.length !== 6) {
        //     throw new Error('Invalid HEX color.');
        // }
        // let r: number = parseInt(hex.slice(0, 2), 16);
        // let g: number = parseInt(hex.slice(2, 4), 16);
        // let b: number = parseInt(hex.slice(4, 6), 16);
        // https://stackoverflow.com/a/3943023/112731
        const { r, g, b } = rgbObj;
        const hex = (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#FFFFFF';
            // console.log(hex);
        return hex;
    }
}