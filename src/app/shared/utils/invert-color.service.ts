import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { colorNameByHexArr } from 'src/app/types/colorNames';

interface rgbObj {
    r: number,
    g: number,
    b: number
}

const names = [...colorNameByHexArr];

@Injectable({
    providedIn: 'root'
})
export class InvertColorService {
    private render: Renderer2
    constructor(private renderFactory: RendererFactory2) {
        this.render = this.renderFactory.createRenderer(null, null);
    }

    standardize_color(color: string): rgbObj | undefined {
        const canvas: HTMLCanvasElement = this.render.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
        if (!ctx) {
            return;
        }
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const rgbData = imgData.slice(0, imgData.length - 1);
        const rgb: rgbObj = { r: rgbData[0], g: rgbData[1], b: rgbData[2] };
        // console.log(rgb);
        return rgb
    }

    invertColor(rgbObj?: rgbObj): string | undefined {
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
        if (!rgbObj) {
            return;
        }
        const { r, g, b } = rgbObj;
        const hex = (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#FFFFFF';
        // console.log(hex);
        return hex;
    }

    private initFunc() {
        // let color: string, rgb: number[], hsl: number[];
        for (let i = 0; i < names.length; i++) {
            const color = "#" + names[i][0];
            const rgb = [...this.colorRgb(color)];
            const hsl = [...this.colorHsl(color)];
            names[i].push(String(rgb[0]), String(rgb[1]), String(rgb[2]), String(hsl[0]), String(hsl[1]), String(hsl[2]));
        }
    }

    colorNameByHex(color: string) {
        this.initFunc();
        color = color.toUpperCase();
        // const names = [...colorNameByHexArr];
        // if (color.length < 3 || color.length > 7)
        //     return ["#000000", "Invalid Color: " + color, false];
        if (color.length % 3 == 0)
            color = "#" + color;
        if (color.length == 4)
            color = "#" + color.substr(1, 1) + color.substr(1, 1) + color.substr(2, 1) + color.substr(2, 1) + color.substr(3, 1) + color.substr(3, 1);

        const rgb = this.colorRgb(color);
        const r = rgb[0], g = rgb[1], b = rgb[2];
        const hsl = this.colorHsl(color);
        const h = hsl[0], s = hsl[1], l = hsl[2];
        let ndf1 = 0, ndf2 = 0, ndf = 0;
        let cl = -1, df = -1;

        for (let i = 0; i < names.length; i++) {
            if (color == "#" + names[i][0])
                return ["#" + names[i][0], names[i][1]];

            ndf1 = Math.pow(r - Number(names[i][2]), 2) + Math.pow(g - Number(names[i][3]), 2) + Math.pow(b - Number(names[i][4]), 2);
            ndf2 = Math.pow(h - Number(names[i][5]), 2) + Math.pow(s - Number(names[i][6]), 2) + Math.pow(l - Number(names[i][7]), 2);
            ndf = ndf1 + ndf2 * 2;
            if (df < 0 || df > ndf) {
                df = ndf;
                cl = i;
            }
        }

        // return (cl < 0 ? ["#000000", "Invalid Color: " + color, false] : ["#" + names[cl][0], names[cl][1], false]);
        return ["#" + names[cl][0], names[cl][1]];
    }

    private colorHsl(color: string): number[] {
        const rgb = [parseInt('0x' + color.substring(1, 3)) / 255, parseInt('0x' + color.substring(3, 5)) / 255, parseInt('0x' + color.substring(5, 7)) / 255];
        // let min: number, max: number, delta: number, h: number, s: number, l: number;
        const r = rgb[0], g = rgb[1], b = rgb[2];

        const min = Math.min(r, Math.min(g, b));
        const max = Math.max(r, Math.max(g, b));
        const delta = max - min;
        const l = (min + max) / 2;

        let s = 0;
        if (l > 0 && l < 1)
            s = delta / (l < 0.5 ? (2 * l) : (2 - 2 * l));

        let h = 0;
        if (delta > 0) {
            if (max == r && max != g) h += (g - b) / delta;
            if (max == g && max != b) h += (2 + (b - r) / delta);
            if (max == b && max != r) h += (4 + (r - g) / delta);
            h /= 6;
        }
        return [parseInt(String(h * 255)), parseInt(String(s * 255)), parseInt(String(l * 255))];
    }

    private colorRgb(color: string): number[] {
        return [parseInt('0x' + color.substring(1, 3)), parseInt('0x' + color.substring(3, 5)), parseInt('0x' + color.substring(5, 7))];
    }
}