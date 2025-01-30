export const calcTowerDamageByDist = (dist: number) => {
    if (dist <= 5) return 600;
    else if (dist <= 20) return 600 - (dist - 5) * 30;
    return 150
}

export const calcTowerDamageToPos = (room: Room, pos: RoomPosition) => {
    return _.sum(room.tower, tower => {
        if (tower.store.energy < 10) return 0;
        let ratio = 1;
        if (tower.effects && tower.effects.length) tower.effects.forEach(e => {
            if (e.effect === PWR_OPERATE_TOWER) ratio = POWER_INFO[e.effect].effect[e.level];
        })
        return calcTowerDamageByDist(tower.pos.getRangeTo(pos)) * ratio;
    })
}
export const calcTowerDamageToCreep = (room: Room, creep: Creep) => {
    if (room.name !== creep.room.name) return 0;

    let damage = calcTowerDamageToPos(room, creep.pos) || 0;
    let realDamage = 0;

    creep.body.forEach(part => {
        if (damage <= 0 || part.hits <= 0) return ;
        let dmg = 0;
        if (part.type === TOUGH && part.boost) {
            dmg = Math.min(Math.floor(damage * BOOSTS[TOUGH][part.boost].damage), part.hits);
        } else {
            dmg = Math.min(damage, part.hits);
        }

        // 造成伤害后减少的伤害量
        if (part.type === TOUGH && part.boost) {
            damage -= Math.ceil(part.hits / BOOSTS[TOUGH][part.boost].damage);
        } else {
            damage -= dmg;
        }

        realDamage += dmg;
    });

    if (damage > 0) realDamage += damage;

    // 计算治疗量
    const healers = creep.pos.findInRange(FIND_CREEPS, 1, {
        filter: c => creep.owner.username === c.owner.username && c.body.some(b => b.type === HEAL)
    });
    const BOOST_POWER = {
        'LO': 2,
        'LHO2': 3,
        'XLHO2': 4,
    }
    let totalHeal = 0;
    healers.forEach(c => {
        if (creep['_heal']) {
            totalHeal += creep['_heal']; return ;
        }
        let h = 0;
        c.body.forEach(part => {
            if (part.type !== HEAL || part.hits <= 0) return ;
            else if (!part.boost) h += 12;
            else h += 12 * BOOST_POWER[part.boost];
        });
        creep['_heal'] = h;
        totalHeal += h;
    });
    return realDamage - totalHeal;
}


/**
 * 计算两点间的切比雪夫距离
 * 因为爬爬走斜的和走直线时间一样，所以用切比雪夫而不是欧几里得近似真实距离
 */
export const getPosDistance = (p1: RoomPosition, p2: RoomPosition) => {
    return Math.max(Math.abs(p1.x-p2.x), Math.abs(p1.y-p2.y));
}
