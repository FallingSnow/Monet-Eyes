function getLowestScaling(native, target) {
    let i = 1,
        scale = 1;
    while ((native / (i *= 2)) > target) {
        scale = i;
    }
    return scale;
}

export function getMinScale (nativeWidth, targetWidth, nativeHeight, targetHeight) {
    const widthScale = getLowestScaling(nativeWidth, targetWidth);
    const heightScale = getLowestScaling(nativeHeight, targetHeight);
    return Math.min(widthScale, heightScale);
}
