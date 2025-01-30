import { roomStructureSpawn } from "./spawn";
import { roomStructureTower } from "./tower";
import { roomStructureLink } from './link';


export const roomStructureWork = (room: Room) => {
    roomStructureSpawn.work(room);
    roomStructureTower.work(room);
    roomStructureLink.work(room);
}