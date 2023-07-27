import { VirtualPortfolioManager } from "../PortfolioManager/VirtualPortfolioManager";
import { LiveBrokerManager } from "./LiveBrokerManager";

//
// Run on Live data but without actual trades, instead make a trade log and virtual portfolio
//

export class DryRunLiveDataBrokerManager extends LiveBrokerManager {
    constructor({ config, db, lggr, stats }) {
        super({ config, db, lggr, stats });
        this.portfolio_manager = new VirtualPortfolioManager();
    }
}
