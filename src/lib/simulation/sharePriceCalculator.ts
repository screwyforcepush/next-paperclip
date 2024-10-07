import { KPI, Order } from '../../types/game'; // Assuming these types are defined in game.ts

function analyzeKPIs(kpiArray: KPI[]): Order[] {
    const orders: Order[] = [];
    const trendThreshold = 0.05;
    const valuationThreshold = 0.3;
    
    // Calculate percentage changes
    const changes: Change[] = kpiArray.map((kpi, index) => {
        if (index === 0) return null;
        const prevKPI = kpiArray[index - 1];
        return {
            revenue: (kpi.revenue - prevKPI.revenue) / prevKPI.revenue,
            profitMargin: kpi.profitMargin - prevKPI.profitMargin,
            marketShare: (kpi.marketShare - prevKPI.marketShare) / prevKPI.marketShare,
            innovationIndex: kpi.innovationIndex - prevKPI.innovationIndex,
            clvCacRatio: (kpi.clvCacRatio - prevKPI.clvCacRatio) / prevKPI.clvCacRatio,
            productionEfficiencyIndex: (kpi.productionEfficiencyIndex - prevKPI.productionEfficiencyIndex) / prevKPI.productionEfficiencyIndex
        };
    }).filter((change): change is Change => change !== null);

    const lastChange = changes[changes.length - 1];
    const lastKPI = kpiArray[kpiArray.length - 1];

    function addOrder(persona: string, action: 'Buy' | 'Sell', reason: string): void {
        orders.push({ persona, action, reason });
    }

    // Trend Followers
    if (lastChange.revenue < -trendThreshold) {
        addOrder('Trend Follower', 'Sell', 'Declining revenue trend');
    } else if (lastChange.revenue > trendThreshold) {
        addOrder('Trend Follower', 'Buy', 'Rising revenue trend');
    }

    // Long-term Investors
    const averageProfitMarginChange = calculateAverageChange(changes, 'profitMargin');
    if (averageProfitMarginChange < -0.01) {
        addOrder('Long-term Investor', 'Sell', 'Consistent profit margin decline');
    } else if (averageProfitMarginChange > 0.01) {
        addOrder('Long-term Investor', 'Buy', 'Consistent profit margin improvement');
    }

    // Short Sellers
    if (lastChange.revenue < 0 && lastChange.profitMargin < 0) {
        addOrder('Short Seller', 'Sell', 'Declining revenue and profit margin');
    } else if (lastChange.revenue > 0 && lastChange.profitMargin > 0) {
        addOrder('Short Seller', 'Buy', 'Rising revenue and profit margin (potential short cover)');
    }

    // Value Investors
    const totalRevenueDrop = (lastKPI.revenue - kpiArray[0].revenue) / kpiArray[0].revenue;
    if (totalRevenueDrop < -valuationThreshold) {
        addOrder('Value Investor', 'Buy', 'Potential undervaluation after significant drop');
    } else if (totalRevenueDrop > valuationThreshold) {
        addOrder('Value Investor', 'Sell', 'Potential overvaluation after significant rise');
    }

    // Growth Investors
    if (lastChange.revenue < 0 && lastChange.marketShare < 0 && lastChange.innovationIndex < 0) {
        addOrder('Growth Investor', 'Sell', 'Decline in growth metrics');
    } else if (lastChange.revenue > 0 && lastChange.marketShare > 0 && lastChange.innovationIndex > 0) {
        addOrder('Growth Investor', 'Buy', 'Improvement in growth metrics');
    }

    // Momentum Traders
    const recentNegativeTrend = isConsistentTrend(changes.slice(-3), 'revenue', false);
    const recentPositiveTrend = isConsistentTrend(changes.slice(-3), 'revenue', true);
    if (recentNegativeTrend) {
        addOrder('Momentum Trader', 'Sell', 'Consistent negative momentum');
    } else if (recentPositiveTrend) {
        addOrder('Momentum Trader', 'Buy', 'Consistent positive momentum');
    }

    // Contrarian Investors
    if (changes.every(change => change.revenue < 0) && changes.length > 5) {
        addOrder('Contrarian Investor', 'Buy', 'Potential overreaction to consistent decline');
    } else if (changes.every(change => change.revenue > 0) && changes.length > 5) {
        addOrder('Contrarian Investor', 'Sell', 'Potential overreaction to consistent rise');
    }

    // Algorithmic Traders
    const algoSignal = changes.reduce((sum, change) => sum + change.revenue, 0);
    if (algoSignal < 0) {
        addOrder('Algorithmic Trader', 'Sell', 'Negative signal from cumulative revenue changes');
    } else if (algoSignal > 0) {
        addOrder('Algorithmic Trader', 'Buy', 'Positive signal from cumulative revenue changes');
    }

    // Dividend Investors
    if (lastChange.profitMargin < -0.01) {
        addOrder('Dividend Investor', 'Sell', 'Decline in profit margin threatening dividends');
    } else if (lastChange.profitMargin > 0.01) {
        addOrder('Dividend Investor', 'Buy', 'Improvement in profit margin supporting dividends');
    }

    // Technical Analysts
    const movingAverage = changes.slice(-5).reduce((sum, change) => sum + change.revenue, 0) / 5;
    if (lastChange.revenue < movingAverage) {
        addOrder('Technical Analyst', 'Sell', 'Price below moving average');
    } else if (lastChange.revenue > movingAverage) {
        addOrder('Technical Analyst', 'Buy', 'Price above moving average');
    }

    // Fundamental Analysts
    if (lastChange.clvCacRatio < 0 && lastChange.productionEfficiencyIndex < 0) {
        addOrder('Fundamental Analyst', 'Sell', 'Declining operational efficiency');
    } else if (lastChange.clvCacRatio > 0 && lastChange.productionEfficiencyIndex > 0) {
        addOrder('Fundamental Analyst', 'Buy', 'Improving operational efficiency');
    }

    // Swing Traders
    const swingSignal = changes.slice(-3).reduce((sum, change) => sum + change.revenue, 0);
    if (swingSignal < 0 && Math.abs(swingSignal) > trendThreshold) {
        addOrder('Swing Trader', 'Sell', 'Short-term downward swing detected');
    } else if (swingSignal > 0 && Math.abs(swingSignal) > trendThreshold) {
        addOrder('Swing Trader', 'Buy', 'Short-term upward swing detected');
    }

    // Event-Driven Traders
    if (Math.abs(lastChange.revenue) > 0.1 || Math.abs(lastChange.profitMargin) > 0.05) {
        const action = lastChange.revenue > 0 ? 'Buy' : 'Sell';
        addOrder('Event-Driven Trader', action, 'Significant change in key metrics suggesting major event');
    }

    // FOMO Traders (reacting to other traders)
    const sellOrders = orders.filter(order => order.action === 'Sell').length;
    const buyOrders = orders.filter(order => order.action === 'Buy').length;
    if (sellOrders > buyOrders * 2) {
        addOrder('FOMO Trader', 'Sell', 'Following the crowd in a strong sell trend');
    } else if (buyOrders > sellOrders * 2) {
        addOrder('FOMO Trader', 'Buy', 'Following the crowd in a strong buy trend');
    }

    // Noise Traders (random decision based on minor fluctuations)
    if (Math.abs(lastChange.revenue) > 0.01) {
        const action = Math.random() > 0.5 ? 'Buy' : 'Sell';
        addOrder('Noise Trader', action, 'Random decision based on minor fluctuations');
    }

    // Quant Traders (using multiple data points)
    const quantScore = changes.reduce((score, change) => {
        return score + change.revenue + change.profitMargin + change.marketShare + change.innovationIndex;
    }, 0);
    if (quantScore < -0.5) {
        addOrder('Quant Trader', 'Sell', 'Negative composite score from multiple metrics');
    } else if (quantScore > 0.5) {
        addOrder('Quant Trader', 'Buy', 'Positive composite score from multiple metrics');
    }

    return orders;
}

function calculateSharePrice(kpiArray: KPI[]): { orders: Order[], newSharePrice: number } {
    const orders = analyzeKPIs(kpiArray);
    const buyOrders = orders.filter(order => order.action === 'Buy').length;
    const sellOrders = orders.filter(order => order.action === 'Sell').length;
    
    const currentKPIs = kpiArray[kpiArray.length - 1];
    const previousSharePrice = currentKPIs.sharePrice || 100; // Default to 100 if not set
    const sharePriceChange = (buyOrders - sellOrders) * 0.01; // 1% change per net order
    const newSharePrice = Number((previousSharePrice * (1 + sharePriceChange)).toFixed(2));

    return { orders, newSharePrice };
}

// Export both functions
export { analyzeKPIs, calculateSharePrice };

// Helper functions to improve readability and reduce duplication
function calculateAverageChange(changes: Change[], property: keyof Change): number {
    return changes.reduce((sum, change) => sum + change[property], 0) / changes.length;
}

function isConsistentTrend(changes: Change[], property: keyof Change, isPositive: boolean): boolean {
    return changes.every(change => isPositive ? change[property] > 0 : change[property] < 0);
}