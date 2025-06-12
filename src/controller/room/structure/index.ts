import { roomStructureSpawn } from "./spawn";
import { roomStructureTower } from "./tower";
import { roomStructureLink } from './link';
import { roomStructureLab } from './lab';
import { roomStructureTerminal } from './terminal';
import { roomStructureFactory } from './factory';
import { roomStructurePowerCreep } from "./powerSpawn";
import { roomStructureContainer } from "./container";
import { roomStructureExtension } from "./extension";

export const roomStructureWork = (room: Room) => {
    roomStructureExtension.work(room);
    roomStructureSpawn.work(room);
    roomStructureTower.work(room);
    roomStructureLink.work(room);
    roomStructureLab.work(room);
    roomStructureTerminal.work(room);
    roomStructureFactory.work(room);
    roomStructurePowerCreep.work(room);
    roomStructureContainer.work(room);
}