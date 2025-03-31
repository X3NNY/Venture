import creepHarvesterAction from "./main/harvester";
import creepUniversalAction from "./main/universal";
import creepCarrierAction from './main/carrier';
import creepBuilderAction from './main/builder';
import creepUpgraderAction from './main/upgrader';
import creepMenderAction from './main/mender';
import creepCourierAction from './main/courier';
import creepManagerAction from './main/manager';
import creepMinerAction from './main/miner';

import creepClaimerAction from './claim/claimer';
import creepSweeperAction from './special/sweeper';

import creepDefendAttackerAction from './defend/defendAttacker';

import creepAidBuilderAction from './aid/builder';
import creepAidCarrierAction from './aid/carrier';

import creepOutScouterAction from './outMine/outScouter';
import creepOutHarvesterAction from './outMine/outHarvester';
import creepOutDefenderAction from './outMine/outDefender';
import creepOutInvaderAction from './outMine/outInvader';
import creepOutCarrierAction from './outMine/outCarrier';
import creepOutBuilderAction from './outMine/outBuilder';
import creepOutReserverAction from './outMine/outReserver';
import creepOutAttackerAction from './outMine/outAttacker';
import creepOutMinerAction from './outMine/outMiner';
import creepOutProtectorAction from './outMine/outProtector';

import creepDoubleAttackerAction from './double/doubleAttacker';
import creepDoubleDismantlerAction from './double/doubleDismantler';
import creepDoubleHealerAction from './double/doubleHealer';

import creepDepositHarvesterAction from './deposit/depositHarvester';
import creepDepositCarrierAction from './deposit/depositCarrier';

import creepPowerAttackerAction from './power/powerAttacker';
import creepPowerHealerAction from './power/powerHealer';
import creepPowerCarrierAction from './power/powerCarrier';
import creepPowerArcherAction from './power/powerArcher';

const actions = {
    harvester: creepHarvesterAction,
    universal: creepUniversalAction,
    carrier: creepCarrierAction,
    builder: creepBuilderAction,
    upgrader: creepUpgraderAction,
    mender: creepMenderAction,
    courier: creepCourierAction,
    manager: creepManagerAction,
    miner: creepMinerAction,

    claimer: creepClaimerAction,
    sweeper: creepSweeperAction,

    defend_attacker: creepDefendAttackerAction,

    // 协助爬爬
    aid_builder: creepAidBuilderAction,
    aid_carrier: creepAidCarrierAction,

    // 外矿采集
    out_scouter: creepOutScouterAction,
    out_harvester: creepOutHarvesterAction,
    out_defender: creepOutDefenderAction,
    out_attacker: creepOutAttackerAction,
    out_invader: creepOutInvaderAction,
    out_carrier: creepOutCarrierAction,
    out_builder: creepOutBuilderAction,
    out_miner: creepOutMinerAction,
    out_reserver: creepOutReserverAction,
    out_protector: creepOutProtectorAction,

    // 双人队
    double_attacker: creepDoubleAttackerAction,
    double_dismantler: creepDoubleDismantlerAction,
    double_healer: creepDoubleHealerAction,

    // 商品采集
    deposit_harvester: creepDepositHarvesterAction,
    deposit_carrier: creepDepositCarrierAction,

    // 超能采集
    power_attacker: creepPowerAttackerAction,
    power_healer: creepPowerHealerAction,
    power_carrier: creepPowerCarrierAction,
    power_archer: creepPowerArcherAction,
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

    if (!actions[role])
        console.log(role, actions[role])
    if (!creep.memory.ready) {
        creep.memory.ready = actions[role].prepare(creep);
        return ;
    }

    // 执行阶段
    const res = actions[role].action(creep);

    // 结束阶段, 不一定有
    actions[role].done?.call(actions[role], creep, res);
}