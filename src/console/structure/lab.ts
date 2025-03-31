import { CompoundMineral } from "@/constant/resource";
import { LAB_STATE } from "@/constant/structure";
import { boostTaskAssign, boostTaskRemove } from "@/controller/creep/function/boost";
import { getRoomList } from "@/controller/room/function/get";
import { roomStructureLab } from "@/controller/room/structure/lab";
import { drawTable } from "@/util/chart";

const labStrings = {
    cn: {
        compound: '化合物',
        amount: '数量',
        room: '房间',

        help: '化工厂指令\n' +
            'open(roomName)\n' +
            '   开启房间化工厂工作\n' +
            'stop(roomName)\n' +
            '   停止房间化工厂工作\n' +
            'set(roomName, product, amount)\n' +
            '   设置房间化工厂产物及数量，设置成功会自动开启化工厂工作。\n' +
            '   若没有设置底物化工厂，你需要在对应化工厂上分别设置旗帜「labA」和「labB」进行指定。\n' +
            'set_boost(roonName)\n'+
            '   设置房间中化工厂生产的强化化合物类型。\n' +
            '   你需要在对应化工厂上设置旗帜「LAB-资源类型」，例如「LAB-UH」，来指定其生产的强化化合物类型。\n' +
            'add_boost(roomName, mineral, amount)\n' +
            '   增加房间中强化化合物生产数量。\n' +
            'remove_boost(roomName, mineral)\n' +
            '   移除房间中强化化合物生产任务。\n' + 
            'set_auto(roomName, compounds, amount)\n' +
            '   设置房间中指定化合物自动合成数量。\n' +
            'remove_auto(roomName, compounds)\n' +
            '   移除房间中指定化合物自动合成任务。\n' +
            'list_auto(roomName)\n' +
            '   查看房间中化合物自动合成列表。',



        room_not_found: `[化工厂指令] 房间「{0}」未在控制列表或未占领。`,
        mineral_not_found: '[化工厂指令] 化合物「{0}」不存在。',
        open_ok: `[化工厂指令] 已开启房间「{0}」化工厂合成工作。`,
        stop_ok: `[化工厂指令] 已停止房间「{0}」化工厂合成工作。`,
        product_not_found: `[化工厂指令] 化合物产物「{0}」不存在。`,
        reactants_lab_set: `[化工厂指令] 底物化工厂已设置为「{0}」和「{1}」。`,
        reactants_set: `[化工厂指令] 底物已设置为「{0}」和「{1}」。`,
        boost_set: `[化工厂指令] 房间「{0}」中化工厂「{1}」的强化资源设置为：「{2}」`,
        boost_set_remove: `[化工厂指令] 房间「{0}」中化工厂「{1}」的强化资源设置已清除。`,
        auto_set_ok: `[化工厂指令] 已设置房间「{0}」化合物「{1}」自动合成，阈值：{2}。`,
        auto_not_set: `[化工厂指令] 房间「{0}」未开启化工厂自动合成。`,
        auto_remove_ok: `[化工厂指令] 已清除房间「{0}」化合物「{1}」自动合成。`,
        auto_list_head: `[化工厂指令] 房间「{0}」的自动合成列表如下：`,
        auto_list_head_all: `[化工厂指令] 全部自动合成列表如下：`,
    },
    us: {
        compound: 'Compounds',
        amount: 'Amount',
        room: 'Room',

        help: 'Lab command list\n' +
            'open(roomName)\n' +
            '   Activate the lab work in the room.\n' +
            'stop(roomName)\n' +
            '   Stop the lab work in the room.\n' +
            'set(roomName, product, amount)\n' +
            '   Set the product and quantity of the lab in the room, lab will work automatically if set up successfully.\n' +
            '   When no substrate labs are set up, you need to specify the substrate lab by setting flags "labA" and "labB" respectively on the corresponding positions.\n' +
            'set_boost(roonName)\n'+
            '   Set the types of boost compounds produced by the lab in the room.\n' +
            '   You need to specify the type by setting flag "LAB-{TYPE}" on the corresponding lab, e.g. "LAB-UH".\n' +
            'add_boost(roomName, mineral, amount)\n' +
            '   Increase the production quantity of boost compounds in the room.\n' +
            'remove_boost(roomName, mineral)\n' +
            '   Remove the boost compounds in the room.\n' + 
            'set_auto(roomName, compounds, amount)\n' +
            '   Set the amount of compounds automatically react in the room.\n' +
            'remove_auto(roomName, compounds)\n' +
            '   Remove automatic reaction task of the compounds in the room.\n' +
            'list_auto(roomName)\n' +
            '   List the automatic reaction of compounds in the room.',

        room_not_found: `[LAB-CMD] 房间 {0} 未在控制列表或未占领。`,
        mineral_not_found: '[LAB-CMD] 化合物「{0}」不存在。',
        open_ok: `[LAB-CMD] 已开启房间 {0} 化工厂合成工作。`,
        stop_ok: `[LAB-CMD] 已停止房间 {0} 化工厂合成工作。`,
        product_not_found: `[LAB-CMD] 化合物产物 {0} 不存在。`,
        reactants_lab_set: `[LAB-CMD] 底物化工厂已设置为 {0} 和 {1}。`,
        reactants_set: `[LAB-CMD] 底物已设置为 {0} 和 {1}。`,
        boost_set: `[LAB-CMD] 房间「{0}」中化工厂「{1}」的强化资源设置为：「{2}」`,
        boost_set_remove: `[LAB-CMD] 房间 {0} 中化工厂 {1} 的强化资源设置已清除。`,
        auto_set_ok: `[LAB-CMD] 已设置房间「{0}」自动合成化合物「{1}」，阈值：{2}。`,
        auto_remove_ok: `[LAB-CMD] 已清除房间「{0}」化合物「{1}」自动合成。`,
        auto_list_head: `[LAB-CMD] 房间「{0}」的自动合成列表如下：`,
        auto_list_head_all: `[LAB-CMD] 房间「{0}」的自动合成列表如下：`,
    }
}

export default {
    lab: {
        // 开启化工厂工作
        open: (roomName: string) => {
            const lang = Memory.lang || 'cn';
            const room = Game.rooms[roomName];
            const memory = Memory.RoomInfo[roomName];
            if (!room || !room.my || !memory) {
                return labStrings[lang].room_not_found.format(roomName);
            }
            roomStructureLab.open(room);
            return labStrings[lang].open_ok.format(roomName);
        },
        // 停止化工厂工作
        stop: (roomName: string) => {
            const lang = Memory.lang || 'cn';
            const room = Game.rooms[roomName];
            const memory = Memory.RoomInfo[roomName];
            if (!room || !room.my || !memory) {
                return labStrings[lang].room_not_found.format(roomName);
            }
            if (!memory.lab) memory.lab = { open: false, state: LAB_STATE.IDLE };
            else memory.lab.open = false;
            return labStrings[lang].stop_ok.format(roomName);
        },
        update: (roomName: string) => {
            const lang = Memory.lang || 'cn';
            const room = Game.rooms[roomName];
            const memory = Memory.RoomInfo[roomName];
            if (!room || !room.my || !memory) {
                return labStrings[lang].room_not_found.format(roomName);
            }
            roomStructureLab.setTarget(room, true);
        },
        // 设置底物和数量
        set: (roomName: string, product: MineralCompoundConstant, amount: number = 0) => {
            const lang = Memory.lang || 'cn';
            const room = Game.rooms[roomName];
            const memory = Memory.RoomInfo[roomName]?.lab;
            if (!room || !room.my || !memory) {
                return labStrings[lang].room_not_found.format(roomName);
            }

            if (!CompoundMineral[product]) {
                return labStrings[lang].product_not_found.format(product)
            }
            let rct1 = CompoundMineral[product].rct1 as MineralConstant;
            let rct2 = CompoundMineral[product].rct2 as MineralConstant;

            memory.labAType = rct1;
            memory.labAType = rct2;
            memory.labAmount = Math.max(0, amount);
            console.log(labStrings[lang].reactants_set.format(rct1, rct2));

            if (!memory.labA || !memory.labB) {
                const labAflag = Game.flags['labA'];
                const labBflag = Game.flags['labB'];
                if (labAflag && labBflag) { 
                    const labA = labAflag.pos.lookFor(LOOK_STRUCTURES).find(s => s.structureType === STRUCTURE_LAB) as StructureLab;
                    const labB = labBflag.pos.lookFor(LOOK_STRUCTURES).find(s => s.structureType === STRUCTURE_LAB) as StructureLab;

                    memory.labA = labA.id;
                    memory.labB = labB.id;
                    console.log(labStrings[lang].reactants_lab_set.format(labA.id, labB.id));
                    labAflag.remove();
                    labBflag.remove();
                }
            }

            memory.open = true;
            return labStrings[lang].open_ok.format(roomName);
        },
        // 设置强化属性
        set_boost: (roomName: string) => {
            const lang = Memory.lang || 'cn';
            const room = Game.rooms[roomName];
            const memory = Memory.RoomInfo[roomName]?.lab;
            if (!room || !room.my || !memory) {
                return labStrings[lang].room_not_found.format(roomName);
            }
            
            if (!memory.BOOST) memory.BOOST = {};

            // 清除失效设置
            for (const labId of Object.keys(memory.BOOST)) {
                const lab = Game.getObjectById(labId as Id<StructureLab>);

                if (!lab) delete memory.BOOST[labId];
            }
            for (const flag of Game.rooms[roomName].find(FIND_FLAGS)) {
                // 旗帜格式: LAB-OH
                const lab_flag = flag.name.match(/^LAB-(\w+)?/);
                if (!lab_flag) continue;
                const lab = flag.pos.lookFor(LOOK_STRUCTURES).find(s => s.structureType === STRUCTURE_LAB);
                if (!lab) continue;
                const mType = lab_flag[1];
                if (!mType || !CompoundMineral[mType]) {
                    delete memory.BOOST[lab.id];
                    flag.remove();
                    console.log(labStrings[lang].boost_set_remove.format(roomName, lab.id));
                    continue;
                }

                memory.BOOST[lab.id].type = mType;
                console.log(labStrings[lang].boost_set.format(roomName, lab.id, mType));
                flag.remove();
            }
            return OK;
        },
        // 增加boost资源数量
        add_boost: (roomName: string, mineral: MineralBoostConstant, amount: number = 3000) => {
            const lang = Memory.lang || 'cn';
            const room = Game.rooms[roomName];
            const memory = Memory.RoomInfo[roomName]?.lab;
            if (!room || !room.my || !memory) {
                return labStrings[lang].room_not_found.format(roomName);
            }

            boostTaskAssign(room, mineral, amount);
            return OK;
        },
        // 移除指定boost类型
        remove_boost: (roomName: string, mineral: MineralBoostConstant) => {
            const lang = Memory.lang || 'cn';
            const room = Game.rooms[roomName];
            const memory = Memory.RoomInfo[roomName]?.lab;
            if (!room || !room.my || !memory) {
                return labStrings[lang].room_not_found.format(roomName);
            }

            boostTaskRemove(room, mineral);
            return OK;
        },
        // 设置化合物自动合成
        set_auto: (roomName: string, product: MineralCompoundConstant, amount: number = 30000) => {
            const lang = Memory.lang || 'cn';
            const room = Game.rooms[roomName];
            const memory = Memory.RoomInfo[roomName]?.lab;
            if (!room || !room.my || !memory) {
                return labStrings[lang].room_not_found.format(roomName);
            }

            if (!CompoundMineral[product]) {
                return labStrings[lang].mineral_not_found.format(product);
            }

            if (!memory.autoQueue) memory.autoQueue = []

            memory.autoQueue.push({
                target: product,
                amount: amount || 0,
                manual: true
            });
            return labStrings[lang].auto_set_ok.format(roomName, product, amount);
        },
        // 清除自动合成
        remove_auto: (roomName: string, product: MineralCompoundConstant) => {
            const lang = Memory.lang || 'cn';
            const room = Game.rooms[roomName];
            const memory = Memory.RoomInfo[roomName]?.lab;
            if (!room || !room.my || !memory) {
                return labStrings[lang].room_not_found.format(roomName);
            }
            if (!CompoundMineral[product]) {
                return labStrings[lang].mineral_not_found.format(product);
            }

            if (!memory.autoQueue) memory.autoQueue = []
            const pos = memory.autoQueue.findIndex(task => task.target === product);
            if (pos !== -1) {
                memory.autoQueue.splice(pos, 1);
            }
            return labStrings[lang].auto_remove_ok.format(roomName, product);
        },
        // 查看列表
        list_auto: (roomName?: string) => {
            const lang = Memory.lang || 'cn';
            const rooms = roomName ? [roomName] : getRoomList();

            if (roomName) {
                const memory = Memory.RoomInfo[roomName]?.lab;
                if (!memory) {
                    return labStrings[lang].room_not_found.format(roomName);
                }
            }

            const data = [];
            for (const room of rooms) {
                const memory = Memory.RoomInfo[room]?.lab;
                if (!memory) continue;
                data.push(...memory.autoQueue?.map(r => [room, r.target, r.amount]))
            }

            if (roomName) {
                console.log(labStrings[lang].auto_list_head.format(roomName));
            } else {
                console.log(labStrings[lang].auto_list_head_all);
            }
            return drawTable(data, [labStrings[lang].room, labStrings[lang].compound, labStrings[lang].amount]);
        },

        help: (func?: string) => {
            const lang = Memory.lang || 'cn';
            if (!func) {
                return labStrings[lang].help;
            }
        }
    }
}