import flagAccUpAction from './acc/up';
import flagAccRepairAction from './acc/repair';

import flagAidBuildAction from './aid/aidBuild';
import flagAidCarryAction from './aid/aidCarry';

import flagAttackAIOAction from './attack/aio';
import flagAttackDoubleAction from './attack/double';

import flagClaimAction from './operate/claim';
import flagTransferAction from './operate/transfer';
import flagUpgradeAction from './operate/upgrade';

const actions = {
    'ACC_UP': flagAccUpAction,
    'ACC_REPAIR': flagAccRepairAction,

    'AID_BUILD': flagAidBuildAction,
    'AID_CARRY': flagAidCarryAction,

    'ATTACK_AIO': flagAttackAIOAction,
    'ATTACK_DOUBLE': flagAttackDoubleAction,

    'CLAIM': flagClaimAction,
    'TRANSFER': flagTransferAction,
    'UPGRADE': flagUpgradeAction,
}

export const flagActionRun = (flag: Flag) => {
    if (!flag.memory.action) {
        for (const key in actions) {
            if (flag.name.startsWith(key)) {
                if (!actions[key].prepare(flag)) {
                    return ;
                }
                flag.memory.action = key;
                break;
            }
        }
    }

    if (!flag || !flag.memory.action) return ;

    if (Game.time - (flag.memory.lastRun || 0) < actions[flag.memory.action].colddown) return ;

    actions[flag.memory.action].action(flag);

    flag.memory.lastRun = Game.time;
}