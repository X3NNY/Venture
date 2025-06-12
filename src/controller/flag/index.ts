import { flagActionRun } from "./action";

/**
 * 旗帜运行
 * @param flag 
 */
export const eventLoop = (flag: Flag) => {
    flagActionRun(flag);
}