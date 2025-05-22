import ColorThief from "../node_modules/colorthief/dist/color-thief.mjs";

import {
    IMG_FILE_NAME,
    IMG_RESIZE_RATIO,
    PLANE_COUNT,
    PLANE_DURATION,
    PLANE_MAX_ROTATION,
    PLANE_POS_OFFSET_RANGE,
    TOTAL_FRAMES,
} from "./settings";
import { random } from "./utils";

//-----------------------------------------------------------------------------//
//-----------------------------------------------------------------------------//
//-----------------------------------------------------------------------------//

export const sketch = (p) => {
    let img;
    let imgFileName = "500839ld.jpg";

    let textImg;

    let backgroundColor;
    const BG_COLOR_INDEX = 0;

    let planes;
    let textPlane;

    //-----------------------------------------------------------------------------//

    p.setup = async () => {
        img = await loadImg(imgFileName);
        backgroundColor = await getDominantColor(imgFileName);

        textImg = await loadImg("text-1.png");

        p.createCanvas(1080, 1080, p.WEBGL);

        p.background(backgroundColor[BG_COLOR_INDEX]);
        p.imageMode(p.CENTER);
        p.rectMode(p.CENTER);
        p.noStroke();

        initPlanes();
        initTextPlane();
    };

    const loadImg = async (url) => {
        const img = await p.loadImage(url);

        if (img.width > img.height) img.resize(0, 1080);
        else img.resize(1080, 0);

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
        for (let i = 0; i < PLANE_COUNT; i++) planes.push(new Plane());
    };

    const initTextPlane = () => {
        textPlane = new Plane(true);
    };

    //-----------------------------------------------------------------------------//

    p.draw = () => {
        drawBackground();
        applyFilters();
        updatePlanes();

        if (p.frameCount < PLANE_DURATION) applyImgMask(imgMask);
        else applyTextMask(textMask);
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
            if (
                planeData.rotateX <= PLANE_MAX_ROTATION ||
                planeData.rotateY <= PLANE_MAX_ROTATION ||
                planeData.rotateZ <= PLANE_MAX_ROTATION
            ) {
                p.push();

                p.translate(planeData.x * p.width, planeData.y * p.height, 0);

                p.rotateX(planeData.rotateX);
                p.rotateY(planeData.rotateY);
                p.rotateZ(planeData.rotateZ);

                p.scale(planeData.scale);
                p.plane(p.width, p.height);

                p.pop();
            }
        }
    };

    const applyTextMask = (mask) => {
        p.push();

        p.clip(mask);

        p.image(textImg, 0, 0);

        p.pop();
    };

    const textMask = () => {
        textPlane.update();

        p.ortho();

        if (
            textPlane.rotateX <= PLANE_MAX_ROTATION ||
            textPlane.rotateY <= PLANE_MAX_ROTATION ||
            textPlane.rotateZ <= PLANE_MAX_ROTATION
        ) {
            p.push();

            p.rotateX(textPlane.rotateX);
            p.rotateY(textPlane.rotateY);
            p.rotateZ(textPlane.rotateZ);

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

        // this.rotatingDirs = [
        //     randomBoolean() ? 1 : -1,
        //     randomBoolean() ? 1 : -1,
        //     randomBoolean() ? 1 : -1,
        // ];

        this.rotatingSpeeds = [
            (PLANE_MAX_ROTATION - this.rotateX) / PLANE_DURATION,
            (PLANE_MAX_ROTATION - this.rotateY) / PLANE_DURATION,
            (PLANE_MAX_ROTATION - this.rotateZ) / PLANE_DURATION,
        ];

        this.scale = random(0.2, 0.8);
    }

    update() {
        if (this.rotateX <= PLANE_MAX_ROTATION)
            this.rotateX += this.rotatingSpeeds[0];
        if (this.rotateY <= PLANE_MAX_ROTATION)
            this.rotateY += this.rotatingSpeeds[1];
        if (this.rotateZ <= PLANE_MAX_ROTATION)
            this.rotateZ += this.rotatingSpeeds[2];
    }
}
