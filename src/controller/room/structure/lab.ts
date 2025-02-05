export const roomStructureLab = {
    work: (room: Room) => {
        if (Game.time % 5 !== 1) return ;
        room.lab.forEach(lab => {
            // 没有矿物， 不处理
            if (!lab.mineralType) return ;

            // 不足3个lab
            if (!room.lab || room.lab.length < 3) return ;

            // 检查内存中的化工厂设置
            const memory = Memory.RoomInfo[room.name];
            if (!memory || !memory.lab || room.memory.defend) return ;
            if (!memory.lab.labA || !memory.lab.labB) return ;

            const labAType = memory.lab.labAType;
            const labBType = memory.lab.labBType;

            if (!labAType || !labBType) return ;

            const labA = Game.getObjectById(memory.lab.labA) as StructureLab;
            const labB = Game.getObjectById(memory.lab.labB) as StructureLab;

            if (!labA || !labB) return ;
            if (labA.store[labAType] < 5 || labB.store[labBType] < 5) return ;

            const labs = room.lab.filter(lab => lab.id !== labA.id && lab.id !== labB.id && lab.cooldown === 0);
            if (!labs || labs.length === 0) return ;

            const boostSetting = Memory.RoomInfo[room.name].lab.BOOST;

            // 遍历其他化工厂作为输出厂进行合成
            for (const lab of labs) {
                const product = REACTIONS[labAType][labBType] as ResourceConstant;

                // 如果化工厂分配的BOOST类型和产物不一样，跳过
                if (boostSetting && boostSetting[lab.id] &&
                    boostSetting[lab.id].type !== product) continue;
                
                // 如果存在与产物不同的资源，跳过
                if (lab.mineralType && lab.mineralType !== product) continue;

                // 如果已满，跳过
                if (lab.store.getFreeCapacity(product) === 0) continue;

                // 合成
                lab.runReaction(labA, labB);
            }
        })
    }
}