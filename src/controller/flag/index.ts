import { flagActionRun } from "./action";
import { flagParse } from "./util";

/**
 * 旗帜运行
 * @param flag 
 */
export const eventLoop = (flag: Flag) => {
    if (!flag.memory.action) {
        flagParse(flag);
    }

    flagActionRun(flag);
}