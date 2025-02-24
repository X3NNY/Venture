import { roomStructureSpawn } from "./spawn";
import { roomStructureTower } from "./tower";
import { roomStructureLink } from './link';
import { roomStructureLab } from './lab';
import { roomStructureTerminal } from './terminal';

export const roomStructureWork = (room: Room) => {
    roomStructureSpawn.work(room);
    roomStructureTower.work(room);
    roomStructureLink.work(room);
    roomStructureLab.work(room);
    roomStructureTerminal.work(room);
}