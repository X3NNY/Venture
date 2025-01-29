import { roomStructureSpawn } from "./spawn";
import { roomStructureTower } from "./tower";


export const roomStructureWork = (room: Room) => {
    roomStructureSpawn.work(room);
    roomStructureTower.work(room);
}