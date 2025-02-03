import creepHarvesterAction from "./main/harvester";
import creepUniversalAction from "./main/universal";
import creepCarrierAction from './main/carrier';
import creepBuilderAction from './main/builder';
import creepUpgraderAction from './main/upgrader';
import creepMenderAction from './main/mender';
import creepCourierAction from './main/courier';
import creepManagerAction from './main/manager';

import creepClaimerAction from './claim/claimer';

import creepDefendAttackerAction from './defend/defendAttacker';

import creepAidBuilderAction from './aid/builder';

import creepOutScouterAction from './outMine/outScouter';
import creepOutHarvesterAction from './outMine/outHarvester';
import creepOutDefenderAction from './outMine/outDefender';
import creepOutInvaderAction from './outMine/outInvader';
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
    courier: creepCourierAction,
    manager: creepManagerAction,

    claimer: creepClaimerAction,

    defend_attacker: creepDefendAttackerAction,

    aid_builder: creepAidBuilderAction,

    // 外矿采集
    out_scouter: creepOutScouterAction,
    out_harvester: creepOutHarvesterAction,
    out_defender: creepOutDefenderAction,
    out_invader: creepOutInvaderAction,
    out_carrier: creepOutCarrierAction,
    out_builder: creepOutBuilderAction,
    out_reserver: creepOutReserverAction,
}

export const creepActionRun = (creep: Creep) => {
    const role = creep.memory.role;

    if (!role) return ;
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