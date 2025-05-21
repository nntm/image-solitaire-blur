import p5 from "p5";
import ColorThief from "./node_modules/colorthief/dist/color-thief.mjs";

import {
    IMG_FILE_NAME,
    IMG_RESIZE_RATIO,
    PLANE_POS_OFFSET_RANGE,
    PLANE_ROTATING_SPEED,
    TOTAL_FRAMES,
} from "./src/settings";
import { randomBoolean, random } from "./src/utils";

//-----------------------------------------------------------------------------//
//-----------------------------------------------------------------------------//
//-----------------------------------------------------------------------------//

const sketch = (p) => {
    let img;
    let imgFileName =
        IMG_FILE_NAME[Math.floor(Math.random() * IMG_FILE_NAME.length)];

    let backgroundColor;

    let planes;

    //-----------------------------------------------------------------------------//

    p.setup = async () => {
        img = await loadImg(imgFileName);
        backgroundColor = await getDominantColor(imgFileName);

        if (window.innerWidth > window.innerHeight)
            p.createCanvas(window.innerHeight, window.innerHeight, p.WEBGL);
        else p.createCanvas(window.innerWidth, window.innerWidth, p.WEBGL);

        p.background(backgroundColor);
        p.imageMode(p.CENTER);
        p.rectMode(p.CENTER);
        p.noStroke();

        initPlanes();
    };

    const loadImg = async (url) => {
        const img = await p.loadImage(url);

        img.resize(
            IMG_RESIZE_RATIO *
                (window.innerWidth > window.innerHeight
                    ? window.innerHeight
                    : window.innerWidth),
            0
        );

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
                    const dominantColor = colorThief.getColor(img);
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
        for (let i = 0; i < 1; i++) planes.push(new Plane());
    };

    //-----------------------------------------------------------------------------//

    p.draw = () => {
        drawBackground();
        applyFilters();
        updatePlanes();
        applyMask(planeMask);
    };

    const drawBackground = () => {
        p.fill(
            backgroundColor[0],
            backgroundColor[1],
            backgroundColor[2],
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

    const applyMask = (mask) => {
        p.push();

        p.clip(mask);

        // p.translate(p.mouseX, p.mouseY);
        // p.image(img, -img.width / 2, -img.height / 2);
        p.image(img, 0, 0);

        p.pop();
    };

    const planeMask = () => {
        p.ortho();

        // p.push();

        // p.rotateX(p.frameCount * PLANE_ROTATING_SPEED);
        // p.rotateY(p.frameCount * PLANE_ROTATING_SPEED);
        // p.rotateZ(p.frameCount * PLANE_ROTATING_SPEED);

        for (const planeData of planes) {
            p.push();

            p.translate(planeData.x * p.width, planeData.y * p.height, 0);

            p.rotateX(planeData.rotateX);
            p.rotateY(planeData.rotateY);
            p.rotateZ(planeData.rotateZ);

            p.scale(0.6);
            p.plane(p.width, p.height);

            p.pop();
        }

        // p.pop();
    };

    //-----------------------------------------------------------------------------//

    p.windowResized = () => {
        if (window.innerWidth > window.innerHeight)
            p.resizeCanvas(window.innerHeight, window.innerHeight, p.WEBGL);
        else p.resizeCanvas(window.innerWidth, window.innerWidth, p.WEBGL);

        p.background(backgroundColor);
    };

    //-----------------------------------------------------------------------------//
    //-----------------------------------------------------------------------------//
    //-----------------------------------------------------------------------------//
};

class Plane {
    constructor() {
        this.x = random(-0.5, 0.5) * PLANE_POS_OFFSET_RANGE;
        this.y = random(-0.5, 0.5) * PLANE_POS_OFFSET_RANGE;

        this.rotateX = random(0, Math.PI * 2);
        this.rotateY = random(0, Math.PI * 2);
        this.rotateZ = random(0, Math.PI * 2);

        this.rotatingSpeeds = [
            PLANE_ROTATING_SPEED * randomBoolean() ? 1 : -1,
            PLANE_ROTATING_SPEED * randomBoolean() ? 1 : -1,
            PLANE_ROTATING_SPEED * randomBoolean() ? 1 : -1,
        ];
    }

    update() {
        this.rotateX += this.rotatingSpeeds[0];
        // this.rotateY += this.rotatingSpeeds[1];
        // this.rotateZ += this.rotatingSpeeds[2];
    }
}

new p5(sketch);
