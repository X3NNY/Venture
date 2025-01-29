export const generateMissionId = (type: string) => {
    return `${type}-${Math.random().toString(16).slice(2)}`;
}