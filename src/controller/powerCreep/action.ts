import { creepIsOnEdge } from "../creep/function/position";
import { powerCreepOperateExtension, powerCreepOperateFactory, powerCreepOperateLab, powerCreepOperatePower, powerCreepOperateSpawn, powerCreepOperateStorage, powerCreepOperateTower, powerCreepRegenSource, powerCreepTransferPower } from "./operate";

const enabledPower = (pc: PowerCreep) => {
    const controller = pc.room?.controller;
    if(controller?.my &&!controller.isPowerEnabled) {
        if(pc.pos.isNearTo(controller)) pc.enableRoom(controller);
        else pc.moveTo(controller)
        return true;
    }
    return false
}

const opsGenerate = (pc: PowerCreep) => {
    if (!pc.powers[PWR_GENERATE_OPS]) return false;
    if (pc.powers[PWR_GENERATE_OPS].cooldown > 0) return false;
    pc.usePower(PWR_GENERATE_OPS);
    return true;
}

const opsTransfer = (pc: PowerCreep) => {
    if (pc.store.getFreeCapacity() === 0 && pc.store[RESOURCE_OPS] > 200) {
        const halfOps = Math.floor(pc.store[RESOURCE_OPS] / 2);
        const amount = Math.min(halfOps, pc.store[RESOURCE_OPS] - 200);
        if (amount <= 0) return false;
        
        if (pc.pos.isNearTo(pc.room.storage)) {
            pc.transfer(pc.room.storage, RESOURCE_OPS, amount); 
        } else {
            pc.moveTo(pc.room.storage);
        }
        return true;
    }
    if (pc.ticksToLive < 50 && pc.store[RESOURCE_OPS] > 0) {
        if (pc.pos.isNearTo(pc.room.storage)) {
            pc.transfer(pc.room.storage, RESOURCE_OPS); 
        } else {
            pc.moveTo(pc.room.storage); 
        }
    }
    return false;
}

const opsWithdraw = (pc: PowerCreep, amount: number = 200) => {
    if (pc.store[RESOURCE_OPS] < amount &&
        (pc.room.storage?.store[RESOURCE_OPS] > amount || pc.room.terminal?.store[RESOURCE_OPS] > amount)) {
            const target = pc.room.storage?.store[RESOURCE_OPS] > amount? pc.room.storage : pc.room.terminal;
            if (pc.pos.isNearTo(target)) {
                pc.withdraw(target, RESOURCE_OPS, amount - pc.store[RESOURCE_OPS]); 
            } else {
                pc.moveTo(target);
            }
            return true;
        }
    return false;
}

const reNew = (pc: PowerCreep) => {
    if (pc.ticksToLive > 500) return false;
    if (pc.room.controller?.my && pc.room.powerSpawn) {
        const powerSpawn = pc.room.powerSpawn;
        if (pc.pos.isNearTo(powerSpawn)) {
            pc.renew(powerSpawn);
        } else {
            pc.moveTo(powerSpawn);
        }
        return true;
    }

    if (!(/^[EW]\d*[1-9][NS]\d*[1-9]$/.test(pc.room.name))) {
        const powerBank = pc.room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_POWER_BANK })[0];

        if (powerBank) {
            if (pc.pos.isNearTo(powerBank)) {
                pc.renew(powerBank); 
            } else {
                pc.moveTo(powerBank);
            }
        }
    }

    if (pc.memory.renewRoom) {
        if (pc.pos.roomName !== pc.memory.renewRoom || creepIsOnEdge(pc)) {
            pc.moveTo(new RoomPosition(25, 25, pc.memory.renewRoom)); 
        } else if (pc.room.powerSpawn) {
            const powerSpawn = pc.room.powerSpawn;
            if (pc.pos.isNearTo(powerSpawn)) {
                pc.renew(powerSpawn); 
            } else {
                pc.moveTo(powerSpawn);
            }
        }
        return true;
    }
    return false;
}

export const powerCreepActionRun = (pc: PowerCreep) => {
    if (!pc.room) return ;

    // 重生
    if (reNew(pc)) return ;

    const flag = Game.flags[`${pc.room.name}-move`];
    if (flag && !pc.pos.inRangeTo(flag, 0)) {
        opsGenerate(pc);
        pc.moveTo(flag, { visualizePathStyle: { stroke: '#ff0000' } });
        return ;
    }

    // 移动到工作房间
    if (pc.room.name !== pc.memory.targetRoom || creepIsOnEdge(pc)) {
        pc.moveTo(new RoomPosition(25, 25, pc.memory.targetRoom));
        return ;
    }

    // 开启超能使用
    if (enabledPower(pc)) return ;
    // 生成ops
    if (opsGenerate(pc)) return ;
    // 转移ops
    if (opsTransfer(pc)) return ;
    // 获取ops
    if (opsWithdraw(pc)) return ;

    if (pc.memory.role === 'F') {
        if (powerCreepOperateStorage(pc)) return true;   // 扩容仓库
        if (powerCreepOperateFactory(pc)) return true;   // 操作工厂
        if (powerCreepOperateLab(pc)) return true;       // 增速LAB
        if (powerCreepOperateTower(pc)) return true;     // 增强炮塔
        if (powerCreepTransferPower(pc)) return true;    // 填充PS
    } else if (pc.memory.role === 'O') {
        if (powerCreepRegenSource(pc)) return true;      // 生成能量
        if (powerCreepOperateTower(pc)) return true;     // 增强炮塔
        if (powerCreepOperateExtension(pc)) return true; // 填充扩展
        if (powerCreepOperateSpawn(pc)) return true;     // 加速孵化
        if (powerCreepOperatePower(pc)) return true;     // 加速PS
    }
}