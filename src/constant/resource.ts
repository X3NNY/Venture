
export const CompoundMineral = {
    // 基础化合物
    [RESOURCE_HYDROXIDE]: { rct1: RESOURCE_HYDROGEN, rct2: RESOURCE_OXYGEN },
    [RESOURCE_ZYNTHIUM_KEANITE]: { rct1: RESOURCE_ZYNTHIUM, rct2: RESOURCE_KEANIUM },
    [RESOURCE_UTRIUM_LEMERGITE]: { rct1: RESOURCE_UTRIUM, rct2: RESOURCE_LEMERGIUM },
    [RESOURCE_GHODIUM]: { rct1: RESOURCE_ZYNTHIUM_KEANITE, rct2: RESOURCE_UTRIUM_LEMERGITE },

    // 一级化合物
    [RESOURCE_UTRIUM_HYDRIDE]: { rct1: RESOURCE_UTRIUM, rct2: RESOURCE_HYDROGEN },
    [RESOURCE_UTRIUM_OXIDE]: { rct1: RESOURCE_UTRIUM, rct2: RESOURCE_OXYGEN },
    [RESOURCE_ZYNTHIUM_OXIDE]: { rct1: RESOURCE_ZYNTHIUM, rct2: RESOURCE_OXYGEN },
    [RESOURCE_ZYNTHIUM_HYDRIDE]: { rct1: RESOURCE_ZYNTHIUM, rct2: RESOURCE_HYDROGEN },
    [RESOURCE_KEANIUM_OXIDE]: { rct1: RESOURCE_KEANIUM, rct2: RESOURCE_OXYGEN },
    [RESOURCE_KEANIUM_HYDRIDE]: { rct1: RESOURCE_KEANIUM, rct2: RESOURCE_HYDROGEN },
    [RESOURCE_LEMERGIUM_OXIDE]: { rct1: RESOURCE_LEMERGIUM, rct2: RESOURCE_OXYGEN },
    [RESOURCE_LEMERGIUM_HYDRIDE]: { rct1: RESOURCE_LEMERGIUM, rct2: RESOURCE_HYDROGEN },
    [RESOURCE_GHODIUM_OXIDE]: { rct1: RESOURCE_GHODIUM, rct2: RESOURCE_OXYGEN },
    [RESOURCE_GHODIUM_HYDRIDE]: { rct1: RESOURCE_GHODIUM, rct2: RESOURCE_HYDROGEN },

    // 二级化合物
    [RESOURCE_UTRIUM_ALKALIDE]: { rct1: RESOURCE_UTRIUM_OXIDE, rct2: RESOURCE_HYDROXIDE },
    [RESOURCE_UTRIUM_ACID]: { rct1: RESOURCE_UTRIUM_HYDRIDE, rct2: RESOURCE_HYDROXIDE },
    [RESOURCE_ZYNTHIUM_ALKALIDE]: { rct1: RESOURCE_ZYNTHIUM_OXIDE, rct2: RESOURCE_HYDROXIDE },
    [RESOURCE_ZYNTHIUM_ACID]: { rct1: RESOURCE_ZYNTHIUM_HYDRIDE, rct2: RESOURCE_HYDROXIDE },
    [RESOURCE_KEANIUM_ALKALIDE]: { rct1: RESOURCE_KEANIUM_OXIDE, rct2: RESOURCE_HYDROXIDE },
    [RESOURCE_KEANIUM_ACID]: { rct1: RESOURCE_KEANIUM_HYDRIDE, rct2: RESOURCE_HYDROXIDE },
    [RESOURCE_LEMERGIUM_ALKALIDE]: { rct1: RESOURCE_LEMERGIUM_OXIDE, rct2: RESOURCE_HYDROXIDE },
    [RESOURCE_LEMERGIUM_ACID]: { rct1: RESOURCE_LEMERGIUM_HYDRIDE, rct2: RESOURCE_HYDROXIDE },
    [RESOURCE_GHODIUM_ALKALIDE]: { rct1: RESOURCE_GHODIUM_OXIDE, rct2: RESOURCE_HYDROXIDE },
    [RESOURCE_GHODIUM_ACID]: { rct1: RESOURCE_GHODIUM_HYDRIDE, rct2: RESOURCE_HYDROXIDE },

    // 三级化合物
    [RESOURCE_CATALYZED_UTRIUM_ALKALIDE]: { rct1: RESOURCE_UTRIUM_ALKALIDE, rct2: RESOURCE_CATALYST },
    [RESOURCE_CATALYZED_UTRIUM_ACID]: { rct1: RESOURCE_UTRIUM_ACID, rct2: RESOURCE_CATALYST },
    [RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE]: { rct1: RESOURCE_ZYNTHIUM_ALKALIDE, rct2: RESOURCE_CATALYST },
    [RESOURCE_CATALYZED_ZYNTHIUM_ACID]: { rct1: RESOURCE_ZYNTHIUM_ACID, rct2: RESOURCE_CATALYST },
    [RESOURCE_CATALYZED_KEANIUM_ALKALIDE]: { rct1: RESOURCE_KEANIUM_ALKALIDE, rct2: RESOURCE_CATALYST },
    [RESOURCE_CATALYZED_KEANIUM_ACID]: { rct1: RESOURCE_KEANIUM_ACID, rct2: RESOURCE_CATALYST },
    [RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE]: { rct1: RESOURCE_LEMERGIUM_ALKALIDE, rct2: RESOURCE_CATALYST },
    [RESOURCE_CATALYZED_LEMERGIUM_ACID]: { rct1: RESOURCE_LEMERGIUM_ACID, rct2: RESOURCE_CATALYST },
    [RESOURCE_CATALYZED_GHODIUM_ALKALIDE]: { rct1: RESOURCE_GHODIUM_ALKALIDE, rct2: RESOURCE_CATALYST },
    [RESOURCE_CATALYZED_GHODIUM_ACID]: { rct1: RESOURCE_GHODIUM_ACID, rct2: RESOURCE_CATALYST },
}

export const BaseMineral = [
    RESOURCE_HYDROGEN, RESOURCE_OXYGEN,
    RESOURCE_KEANIUM, RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_ZYNTHIUM,
    RESOURCE_CATALYST
]

export const BaseBar = [
    RESOURCE_UTRIUM_BAR, RESOURCE_KEANIUM_BAR, RESOURCE_LEMERGIUM_BAR, RESOURCE_ZYNTHIUM_BAR,
    RESOURCE_OXIDANT, RESOURCE_REDUCTANT,
    RESOURCE_PURIFIER,
    // RESOURCE_GHODIUM_MELT,
    // RESOURCE_BATTERY
]


export const LabTarget = {
    // 基础
    OH: [
        { target: RESOURCE_HYDROXIDE, amount: 3000 },
        { target: RESOURCE_ZYNTHIUM_KEANITE, amount: 1000 },
        { target: RESOURCE_UTRIUM_LEMERGITE, amount: 1000 },
        { target: RESOURCE_GHODIUM, amount: 6000 },
    ],
    G: [
        // XGH2O 生产线，强化 WORK 的 upgrade
        { target: RESOURCE_GHODIUM_HYDRIDE, amount: 3000 }, 
        { target: RESOURCE_GHODIUM_ACID, amount: 5000 }, 
        { target: RESOURCE_CATALYZED_GHODIUM_ACID, amount: 4000 }, 
        // XGHO2 生产线，强化 TOUGH
        { target: RESOURCE_GHODIUM_OXIDE, amount: 4000 }, 
        { target: RESOURCE_GHODIUM_ALKALIDE, amount: 5000 }, 
        { target: RESOURCE_CATALYZED_GHODIUM_ALKALIDE, amount: 4000 },
    ],
    U: [
        { target: RESOURCE_UTRIUM_LEMERGITE, amount: 3000 },
        { target: RESOURCE_GHODIUM, amount: 5000 },
        // XUH2O 生产线，强化 ATTACK
        { target: RESOURCE_UTRIUM_HYDRIDE, amount: 4000 },
        { target: RESOURCE_UTRIUM_ACID, amount: 5000 },
        { target: RESOURCE_CATALYZED_UTRIUM_ACID, amount: 4000 },
        // XUHO2 生产线，强化 HARVEST
        { target: RESOURCE_UTRIUM_OXIDE, amount: 3000 },
        { target: RESOURCE_UTRIUM_ALKALIDE, amount: 5000 },
        { target: RESOURCE_CATALYZED_UTRIUM_ALKALIDE, amount: 4000 },
    ],
    K: [
        { target: RESOURCE_ZYNTHIUM_KEANITE, amount: 3000 },
        { target: RESOURCE_GHODIUM, amount: 5000 },
        // XKH2O 生产线，强化 CARRY
        { target: RESOURCE_KEANIUM_HYDRIDE, amount: 3000 },
        { target: RESOURCE_KEANIUM_ACID, amount: 5000 },
        { target: RESOURCE_CATALYZED_KEANIUM_ACID, amount: 4000 },
        // XKHO2 生产线，强化 RANGE_ATTACK
        { target: RESOURCE_KEANIUM_OXIDE, amount: 3000 }, 
        { target: RESOURCE_KEANIUM_ALKALIDE, amount: 5000 }, 
        { target: RESOURCE_CATALYZED_KEANIUM_ALKALIDE, amount: 4000 },  
    ],
    L: [
        { target: RESOURCE_UTRIUM_LEMERGITE, amount: 3000 },
        { target: RESOURCE_GHODIUM, amount: 5000 },
        // XLH2O 生产线，强化 WORK 的 repair/build
        { target: RESOURCE_LEMERGIUM_HYDRIDE, amount: 3000 }, 
        { target: RESOURCE_LEMERGIUM_ACID, amount: 5000 }, 
        { target: RESOURCE_CATALYZED_LEMERGIUM_ACID, amount: 4000 }, 
        // XLHO2 生产线，强化 HEAL
        { target: RESOURCE_LEMERGIUM_OXIDE, amount: 4000 }, 
        { target: RESOURCE_LEMERGIUM_ALKALIDE, amount: 5000 }, 
        { target: RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE, amount: 4000 },
    ],
    Z: [
        { target: RESOURCE_ZYNTHIUM_KEANITE, amount: 3000 },
        { target: RESOURCE_GHODIUM, amount: 5000 },
        // XZH2O 生产线，强化 WORK 的 dismantle
        { target: RESOURCE_ZYNTHIUM_HYDRIDE, amount: 3000 }, 
        { target: RESOURCE_ZYNTHIUM_ACID, amount: 5000 }, 
        { target: RESOURCE_CATALYZED_ZYNTHIUM_ACID, amount: 4000 }, 
        // XZHO2 生产线，强化 MOVE
        { target: RESOURCE_ZYNTHIUM_OXIDE, amount: 3000 }, 
        { target: RESOURCE_ZYNTHIUM_ALKALIDE, amount: 5000 }, 
        { target: RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE, amount: 4000 },
    ]
}

export const HighWayLabTarget = [
    { target: RESOURCE_LEMERGIUM_OXIDE, amount: 18000},
    { target: RESOURCE_GHODIUM_OXIDE, amount: 6000},
    { target: RESOURCE_UTRIUM_HYDRIDE, amount: 9000},
    
    { target: RESOURCE_GHODIUM_HYDRIDE, amount: 6000},
    { target: RESOURCE_HYDROXIDE, amount: 6000},
    { target: RESOURCE_GHODIUM_ALKALIDE, amount: 9000},
    { target: RESOURCE_UTRIUM_ACID, amount: 18000},
]

export const FactoryTarget = {
    [RESOURCE_MIST]: {
        0: [
            { product: RESOURCE_CONDENSATE, amount: 2000},     // 0
        ],
        1: [
            { product: RESOURCE_CONCENTRATE, amount: 30},      // 1
        ],
        2: [
            { product: RESOURCE_CRYSTAL, amount: 120},         // crystal
            { product: RESOURCE_EXTRACT, amount: 20},          // 2
        ],
        3: [
            { product: RESOURCE_SPIRIT, amount: 10},           // 3
        ],
        4: [
            { product: RESOURCE_EMANATION, amount: 4},         // 4
        ],
        5: [
            { product: RESOURCE_ESSENCE, amount: 1},           // 5
        ]
    }
}

export const ResourceBarMap = {
    [RESOURCE_KEANIUM]: RESOURCE_KEANIUM_BAR,
    [RESOURCE_LEMERGIUM]: RESOURCE_LEMERGIUM_BAR,
    [RESOURCE_GHODIUM]: RESOURCE_GHODIUM_MELT,
    [RESOURCE_ZYNTHIUM]: RESOURCE_ZYNTHIUM_BAR,
    [RESOURCE_UTRIUM]: RESOURCE_UTRIUM_BAR,
    [RESOURCE_OXYGEN]: RESOURCE_OXIDANT,
    [RESOURCE_HYDROGEN]: RESOURCE_REDUCTANT,
    [RESOURCE_CATALYST]: RESOURCE_PURIFIER,
    [RESOURCE_ENERGY]: RESOURCE_BATTERY
}

export const BoostTarget = {
    [RESOURCE_GHODIUM_HYDRIDE]: {
        threshold: 1500,
        amount: 600,
    },
    [RESOURCE_GHODIUM_ACID]: {
        threshold: 2000,
        amount: 600,
    },
    [RESOURCE_CATALYZED_GHODIUM_ACID]: {
        threshold: 3000,
        amount: 600,
    }
}

export const Goods = [
    RESOURCE_COMPOSITE, RESOURCE_CRYSTAL, RESOURCE_LIQUID,

    RESOURCE_WIRE, RESOURCE_CELL, RESOURCE_ALLOY, RESOURCE_CONDENSATE,
    RESOURCE_TUBE, RESOURCE_FIXTURES, RESOURCE_TISSUE, RESOURCE_TRANSISTOR, RESOURCE_EXTRACT,
    RESOURCE_PHLEGM, RESOURCE_FRAME, RESOURCE_MUSCLE, RESOURCE_MICROCHIP, RESOURCE_SPIRIT,
    RESOURCE_SWITCH, RESOURCE_HYDRAULICS, RESOURCE_ORGANOID, RESOURCE_CIRCUIT, RESOURCE_EMANATION,
    RESOURCE_CONCENTRATE, RESOURCE_MACHINE, RESOURCE_ORGANISM, RESOURCE_DEVICE, RESOURCE_ESSENCE,
]

export const factoryBlacklist = [
    RESOURCE_ENERGY,
    RESOURCE_HYDROGEN,
    RESOURCE_OXYGEN,
    RESOURCE_UTRIUM,
    RESOURCE_KEANIUM,
    RESOURCE_LEMERGIUM,
    RESOURCE_ZYNTHIUM,
    RESOURCE_CATALYST,
    RESOURCE_GHODIUM
]