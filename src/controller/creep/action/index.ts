import { CREEP_ROLE } from "@/constant/creep";
import creepHarvesterAction from "./main/harvester";
import creepUniversalAction from "./main/universal";
import creepCarrierAction from './main/carrier';
import creepBuilderAction from './main/builder';
import creepUpgraderAction from './main/upgrader';
import creepMenderAction from './main/mender';
import creepDefendAttackerAction from './defend/defendAttacker';

import creepOutScouterAction from './outMine/outScouter';
import creepOutHarvesterAction from './outMine/outHarvester';
import creepOutDefenderAction from './outMine/outDefender';
import creepOutCarrierAction from './outMine/outCarrier';
import creepOutBuilderAction from './outMine/outBuilder';
import creepOutReserverAction from './outMine/outReserver';

const actions = {
    harvester: creepHarvesterAction,
    universal: creepUniversalAction,
    carrier: creepCarrierAction,
    builder: creepBuilderAction,
    upgrader: creepUpgraderAction,
    mender: creepMenderAction,

    defend_attacker: creepDefendAttackerAction,

    // 外矿采集
    out_scouter: creepOutScouterAction,
    out_harvester: creepOutHarvesterAction,
    out_defender: creepOutDefenderAction,
    out_carrier: creepOutCarrierAction,
    out_builder: creepOutBuilderAction,
    out_reserver: creepOutReserverAction,
}

export const creepActionRun = (creep: Creep) => {
    const role = creep.memory.role;

    // if (!role) {
    //     console.log(creep.name, JSON.stringify(creep.memory))
    //     creep.memory = {
    //         role: 'universal',
    //         home: creep.room.name,
    //     } as any;
    // }
    // console.log(JSON.stringify(creep.memory))
    // 准备阶段
    if (!creep.memory.ready) {
        creep.memory.ready = actions[role].prepare(creep);
        return ;
    }

    // 执行阶段
    const res = actions[role].action(creep);

    // 结束阶段, 不一定有
    actions[role].done?.call(actions[role], creep, res);
}