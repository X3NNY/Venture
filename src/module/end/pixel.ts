export const endGeneratePixel = () => {
    if (Game.cpu.bucket === 10000) {
        Game.cpu.generatePixel();
    }
}