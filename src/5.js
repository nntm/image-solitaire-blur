import ColorThief from "colorthief";

import {
    PLANE_COUNT,
    PLANE_DURATION,
    PLANE_MAX_ROTATION,
    PLANE_POS_OFFSET_RANGE,
    PLANE_ROTATING_SPEED,
    TOTAL_FRAMES,
} from "./settings";
import { random, randomBoolean } from "./utils";

//-----------------------------------------------------------------------------//
//-----------------------------------------------------------------------------//
//-----------------------------------------------------------------------------//

export const sketch = (p) => {
    let img;

    let textImg;

    let backgroundColor;
    const BG_COLOR_INDEX = 0;

    let planes;
    let textPlane;

    //-----------------------------------------------------------------------------//

    p.setup = async () => {
        img = await loadImg("the-virgin.jpg");
        backgroundColor = await getDominantColor("the-virgin.jpg");

        p.createCanvas(1920, 1080, p.WEBGL);

        p.background(backgroundColor[BG_COLOR_INDEX]);
        p.imageMode(p.CENTER);
        p.rectMode(p.CENTER);
        p.noStroke();

        initPlanes();
    };

    const loadImg = async (url) => {
        const img = await p.loadImage(url);

        img.resize(0, 1920);

        return img;
    };

    const getDominantColor = async (url) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.crossOrigin = "anonymous";

            const colorThief = new ColorThief();

            img.onload = () => {
                try {
                    const dominantColor = colorThief.getPalette(img, 2);
                    resolve(dominantColor);
                } catch (err) {
                    reject(err);
                }
            };

            img.onerror = reject;
        });
    };

    const initPlanes = () => {
        planes = [];
        for (let i = 0; i < 3; i++) planes.push(new Plane());
    };

    //-----------------------------------------------------------------------------//

    p.draw = () => {
        drawBackground();
        applyFilters();
        updatePlanes();

        applyImgMask(imgMask);
    };

    const drawBackground = () => {
        p.fill(
            backgroundColor[BG_COLOR_INDEX][0],
            backgroundColor[BG_COLOR_INDEX][1],
            backgroundColor[BG_COLOR_INDEX][2],
            ((p.frameCount % TOTAL_FRAMES) / TOTAL_FRAMES) * 20
        );

        p.rect(0, 0, p.width, p.height);
    };

    const applyFilters = () => {
        p.filter(p.BLUR, 2);
        p.filter(p.DILATE);
    };

    const updatePlanes = () => {
        for (const planeData of planes) planeData.update();
    };

    const applyImgMask = (mask) => {
        p.push();

        p.clip(mask);

        // p.translate(p.mouseX, p.mouseY);
        // p.image(img, -img.width / 2, -img.height / 2);
        p.image(img, 0, 0);

        p.pop();
    };

    const imgMask = () => {
        p.ortho();

        for (const planeData of planes) {
            p.push();

            p.translate(planeData.x * p.width, planeData.y * p.height, 0);

            p.rotateX(planeData.rotateX);
            p.rotateY(planeData.rotateY);
            p.rotateZ(planeData.rotateZ);

            p.scale(planeData.scale);
            p.plane(p.width, p.height);

            p.pop();
        }
    };

    //-----------------------------------------------------------------------------//

    p.windowResized = () => {
        // if (window.innerWidth > window.innerHeight)
        //     p.resizeCanvas(window.innerHeight, window.innerHeight, p.WEBGL);
        // else p.resizeCanvas(window.innerWidth, window.innerWidth, p.WEBGL);
        // p.background(backgroundColor);
    };

    //-----------------------------------------------------------------------------//
    //-----------------------------------------------------------------------------//
    //-----------------------------------------------------------------------------//
};

class Plane {
    constructor(startingRotation = false) {
        this.x = random(-0.5, 0.5) * PLANE_POS_OFFSET_RANGE;
        this.y = random(-0.5, 0.5) * PLANE_POS_OFFSET_RANGE;

        if (startingRotation) {
            let n = Math.floor(Math.random() * 3);

            if (n == 0) {
                this.rotateX = random(0, Math.PI);
                this.rotateY = Math.PI / 2;
                this.rotateZ = Math.PI / 2;
            } else if (n == 1) {
                this.rotateX = Math.PI / 2;
                this.rotateY = random(0, Math.PI);
                this.rotateZ = Math.PI / 2;
            } else {
                this.rotateX = Math.PI / 2;
                this.rotateY = Math.PI / 2;
                this.rotateZ = random(0, Math.PI);
            }
        } else {
            this.rotateX = random(0, Math.PI);
            this.rotateY = random(0, Math.PI);
            this.rotateZ = random(0, Math.PI);
        }

        this.rotatingSpeeds = [
            PLANE_ROTATING_SPEED * (randomBoolean() ? 1 : -1),
            PLANE_ROTATING_SPEED * (randomBoolean() ? 1 : -1),
            PLANE_ROTATING_SPEED * (randomBoolean() ? 1 : -1),
        ];

        this.scale = random(0.6, 1);
    }

    update() {
        this.rotateX += this.rotatingSpeeds[0];
        this.rotateY += this.rotatingSpeeds[1];
        this.rotateZ += this.rotatingSpeeds[2];
    }
}
