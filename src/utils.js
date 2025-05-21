export const randomBoolean = () => {
    return Math.random() >= 0.5;
};

export const random = (min, max) => {
    return Math.random() * (max - min) + min;
};
