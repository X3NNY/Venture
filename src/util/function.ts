import { BaseConfig } from "@/constant/config";

export const insertSorted = (arr: any[], newObj: any, key: string) => {
    // 二分查找找到插入位置
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        if (arr[mid][key] <= newObj[key]) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    arr.splice(left, 0, newObj);
}

export const getCpuConsumption = (func: CallableFunction) => {
    const start = Game.cpu.getUsed();
    func();
    console.log(func.name, 'consume CPU:', Game.cpu.getUsed() - start);
}

export const isLPShard = () => {
    return Game.shard.name === BaseConfig.LP_SHARD;
}