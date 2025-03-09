import { powerCreepActionRun } from "./action";

export const eventLoop = (pc: PowerCreep) => {
    if (!pc) return;

    if (!pc.ticksToLive) {
        if (Game.time % 20) return; // 每20tick检查一次
        if (pc.spawnCooldownTime > Date.now()) return;
        const pcMem = pc.memory;
        const powerSpawn = Game.rooms[pcMem['spawnRoom']]?.powerSpawn;

        if (powerSpawn) {
            const result = pc.spawn(powerSpawn);
            
            if (result !== OK) {
                console.log(`PowerCreep ${pc.name} 在 ${pcMem['spawnRoom']} 孵化失败: ${result}`);
            }
        }
    }

    powerCreepActionRun(pc);
}