import { KPI, Order } from '@/types/game'; // Assuming these types are defined in game.ts
import { Logger } from '@/lib/utils/logger';

interface Change {
    revenue: number;
    profitMargin: number;
    marketShare: number;
    innovationIndex: number;
    clvCacRatio: number;
    productionEfficiencyIndex: number;
}

const weights = {
    revenue: 0.25,
    profitMargin: 0.25,
    marketShare: 0.2,
    innovationIndex: 0.15,
    clvCacRatio: 0.1,
    productionEfficiencyIndex: 0.05
};

/**
 * Calculates the weighted change based on defined KPI weights.
 * @param change - The Change object containing individual KPI changes.
 * @returns The weighted change value.
 */
function weightedChange(change: Change): number {
    return Object.keys(weights).reduce((sum, key) => {
        return sum + (change[key as keyof Change] * weights[key as keyof typeof weights]);
    }, 0);
}

function calculateTrend(changes: Change[], periods: number): number {
    if (changes.length < periods) {
        periods = changes.length;
    }
    return changes.slice(-periods).reduce((sum, change) => sum + weightedChange(change), 0) / periods;
}

function addOrder(orders: Order[], persona: string, action: 'Buy' | 'Sell', reason: string): Order[] {
    orders.push({ persona, action, reason });
    return orders;
}

function analyzeKPIs(kpiArray: KPI[]): Order[] {
    try {
        let orders: Order[] = [];
        const buyThreshold = 0.02;
        const sellThreshold = -0.02;
        const hysteresis = 0.01;
        const valuationThreshold = 0.3;
        
        // Remove duplicate KPI entries
        const uniqueKPIArray = kpiArray.filter((kpi, index, self) =>
            index === self.findIndex((t) => (
                t.revenue === kpi.revenue &&
                t.profitMargin === kpi.profitMargin &&
                t.marketShare === kpi.marketShare &&
                t.innovationIndex === kpi.innovationIndex
            ))
        );

        // Recalculate changes with the cleaned data
        const changes: Change[] = uniqueKPIArray.map((kpi, index) => {
            if (index === 0) return null;
            const prevKPI = uniqueKPIArray[index - 1];
            return {
                revenue: safeDivide(kpi.revenue, prevKPI.revenue),
                profitMargin: kpi.profitMargin - prevKPI.profitMargin,
                marketShare: safeDivide(kpi.marketShare, prevKPI.marketShare),
                innovationIndex: kpi.innovationIndex - prevKPI.innovationIndex,
                clvCacRatio: safeDivide(kpi.clvCacRatio, prevKPI.clvCacRatio),
                productionEfficiencyIndex: safeDivide(kpi.productionEfficiencyIndex, prevKPI.productionEfficiencyIndex)
            };
        }).filter((change): change is Change => change !== null);

        const lastChange = changes[changes.length - 1];
        const lastKPI = uniqueKPIArray[uniqueKPIArray.length - 1];
        const shortTermTrend = calculateTrend(changes, 3);
        const longTermTrend = calculateTrend(changes, changes.length);

        // Trend Followers
        if (shortTermTrend < sellThreshold && longTermTrend < sellThreshold - hysteresis) {
            orders = addOrder(orders, 'Trend Follower', 'Sell', 'Declining trend in weighted KPIs');
        } else if (shortTermTrend > buyThreshold && longTermTrend > buyThreshold + hysteresis) {
            orders = addOrder(orders, 'Trend Follower', 'Buy', 'Rising trend in weighted KPIs');
        }

        // Long-term Investors
        const averageProfitMarginChange = calculateAverageChange(changes, 'profitMargin');
        if (averageProfitMarginChange < -0.01) {
            orders = addOrder(orders, 'Long-term Investor', 'Sell', 'Consistent profit margin decline');
        } else if (averageProfitMarginChange > 0.01) {
            orders = addOrder(orders, 'Long-term Investor', 'Buy', 'Consistent profit margin improvement');
        }

        // Short Sellers
        if (lastChange.revenue < 0 && lastChange.profitMargin < 0) {
            orders = addOrder(orders, 'Short Seller', 'Sell', 'Declining revenue and profit margin');
        } else if (lastChange.revenue > 0 && lastChange.profitMargin > 0) {
            orders = addOrder(orders, 'Short Seller', 'Buy', 'Rising revenue and profit margin (potential short cover)');
        }

        // Value Investors
        const totalRevenueDrop = (lastKPI.revenue - uniqueKPIArray[0].revenue) / uniqueKPIArray[0].revenue;
        if (totalRevenueDrop < -valuationThreshold) {
            orders = addOrder(orders, 'Value Investor', 'Buy', 'Potential undervaluation after significant drop');
        } else if (totalRevenueDrop > valuationThreshold) {
            orders = addOrder(orders, 'Value Investor', 'Sell', 'Potential overvaluation after significant rise');
        }

        // Growth Investors
        if (lastChange.revenue < 0 && lastChange.marketShare < 0 && lastChange.innovationIndex < 0) {
            orders = addOrder(orders, 'Growth Investor', 'Sell', 'Decline in growth metrics');
        } else if (lastChange.revenue > 0 && lastChange.marketShare > 0 && lastChange.innovationIndex > 0) {
            orders = addOrder(orders, 'Growth Investor', 'Buy', 'Improvement in growth metrics');
        }

        // Momentum Traders
        const recentNegativeTrend = isConsistentTrend(changes.slice(-3), 'revenue', false);
        const recentPositiveTrend = isConsistentTrend(changes.slice(-3), 'revenue', true);
        if (recentNegativeTrend) {
            orders = addOrder(orders, 'Momentum Trader', 'Sell', 'Consistent negative momentum');
        } else if (recentPositiveTrend) {
            orders = addOrder(orders, 'Momentum Trader', 'Buy', 'Consistent positive momentum');
        }

        // Contrarian Investors
        if (lastChange.revenue < 0 && shortTermTrend < sellThreshold) {
            orders = addOrder(orders, 'Contrarian Investor', 'Buy', 'Buying in the face of negative trends');
        } else if (lastChange.revenue > 0 && shortTermTrend > buyThreshold) {
            orders = addOrder(orders, 'Contrarian Investor', 'Sell', 'Selling in the face of positive trends');
        }

        // Algorithmic Traders
        const algoSignal = changes.reduce((sum, change) => sum + weightedChange(change), 0);
        if (algoSignal < -buyThreshold) {
            orders = addOrder(orders, 'Algorithmic Trader', 'Sell', 'Negative signal from cumulative weighted changes');
        } else if (algoSignal > buyThreshold) {
            orders = addOrder(orders, 'Algorithmic Trader', 'Buy', 'Positive signal from cumulative weighted changes');
        }

        // Dividend Investors
        if (lastChange.profitMargin < -0.01) {
            orders = addOrder(orders, 'Dividend Investor', 'Sell', 'Decline in profit margin threatening dividends');
        } else if (lastChange.profitMargin > 0.01) {
            orders = addOrder(orders, 'Dividend Investor', 'Buy', 'Improvement in profit margin supporting dividends');
        }

        // Technical Analysts
        const movingAverage = changes.slice(-5).reduce((sum, change) => sum + weightedChange(change), 0) / 5;
        if (weightedChange(lastChange) < movingAverage - hysteresis) {
            orders = addOrder(orders, 'Technical Analyst', 'Sell', 'Weighted change below moving average');
        } else if (weightedChange(lastChange) > movingAverage + hysteresis) {
            orders = addOrder(orders, 'Technical Analyst', 'Buy', 'Weighted change above moving average');
        }

        // Fundamental Analysts
        if (lastChange.clvCacRatio < 0 && lastChange.productionEfficiencyIndex < 0) {
            orders = addOrder(orders, 'Fundamental Analyst', 'Sell', 'Declining operational efficiency');
        } else if (lastChange.clvCacRatio > 0 && lastChange.productionEfficiencyIndex > 0) {
            orders = addOrder(orders, 'Fundamental Analyst', 'Buy', 'Improving operational efficiency');
        }

        // Swing Traders
        const swingSignal = changes.slice(-3).reduce((sum, change) => sum + weightedChange(change), 0);
        if (swingSignal < -buyThreshold) {
            orders = addOrder(orders, 'Swing Trader', 'Sell', 'Short-term downward swing detected');
        } else if (swingSignal > buyThreshold) {
            orders = addOrder(orders, 'Swing Trader', 'Buy', 'Short-term upward swing detected');
        }

        // Event-Driven Traders
        if (Math.abs(weightedChange(lastChange)) > 0.05) {
            const action = weightedChange(lastChange) > 0 ? 'Buy' : 'Sell';
            orders = addOrder(orders, 'Event-Driven Trader', action, 'Significant change in weighted metrics suggesting major event');
        }

        // FOMO Traders (reacting to other traders)
        const sellOrders = orders.filter(order => order.action === 'Sell').length;
        const buyOrders = orders.filter(order => order.action === 'Buy').length;
        if (sellOrders > buyOrders * 2) {
            orders = addOrder(orders, 'FOMO Trader', 'Sell', 'Following the crowd in a strong sell trend');
        } else if (buyOrders > sellOrders * 2) {
            orders = addOrder(orders, 'FOMO Trader', 'Buy', 'Following the crowd in a strong buy trend');
        }

        // Noise Traders (random decision based on minor fluctuations)
        if (Math.abs(weightedChange(lastChange)) > 0.01) {
            const action = Math.random() > 0.5 ? 'Buy' : 'Sell';
            orders = addOrder(orders, 'Noise Trader', action, 'Random decision based on minor fluctuations');
        }

        // Quant Traders (using multiple data points)
        const quantScore = changes.reduce((score, change) => score + weightedChange(change), 0);
        if (quantScore < -0.5) {
            orders = addOrder(orders, 'Quant Trader', 'Sell', 'Negative composite score from multiple metrics');
        } else if (quantScore > 0.5) {
            orders = addOrder(orders, 'Quant Trader', 'Buy', 'Positive composite score from multiple metrics');
        }

        // Enhancing the Momentum Traders logic
        const momentumThreshold = 0.01;
        if (shortTermTrend > momentumThreshold && longTermTrend > momentumThreshold) {
            orders = addOrder(orders, 'Momentum Trader', 'Buy', 'Positive momentum detected');
        } else if (shortTermTrend < -momentumThreshold && longTermTrend < -momentumThreshold) {
            orders = addOrder(orders, 'Momentum Trader', 'Sell', 'Negative momentum detected');
        }

        return orders;
    } catch (error) {
        console.error('Error analyzing KPIs:', error);
        return [];
    }
}

function calculateMarketSentiment(kpiArray: KPI[]): number {
    const recentKPIs = kpiArray.slice(-3);
    const totalSentiment = recentKPIs.reduce((sum, kpi) => {
        const sentiment = (kpi.innovationIndex + kpi.marketShare + kpi.profitMargin) / 3;
        return sum + sentiment;
    }, 0);
    return totalSentiment / recentKPIs.length; // Average sentiment over recent periods
}

function calculateSharePrice(kpiArray: KPI[]): { orders: Order[], newSharePrice: number } {
    const orders = analyzeKPIs(kpiArray);
    const buyOrders = orders.filter(order => order.action === 'Buy').length;
    const sellOrders = orders.filter(order => order.action === 'Sell').length;
    
    const currentKPIs = kpiArray.length >= 2 ? kpiArray[kpiArray.length - 2] : kpiArray[kpiArray.length - 1];
    const previousSharePrice = currentKPIs.sharePrice || 100; // Default to 100 if not set

    const netOrderEffect = (buyOrders - sellOrders) / (buyOrders + sellOrders || 1); // Prevent division by zero
    const marketSentiment = calculateMarketSentiment(kpiArray); // Value between 0 and 1
    const sentimentFactor = 1 + (marketSentiment - 0.5) * 0.2; // Adjusts between 0.9 and 1.1

    const sharePriceChangePercentage = netOrderEffect * sentimentFactor * 0.05; // Max 5% change
    const newSharePrice = Number((previousSharePrice * (1 + sharePriceChangePercentage)).toFixed(2));


    Logger.debug('[calculateSharePrice] Orders:', orders);
    Logger.debug('[calculateSharePrice] Buy orders:', buyOrders);
    Logger.debug('[calculateSharePrice] Sell orders:', sellOrders);
    Logger.debug('[calculateSharePrice] Current KPIs:', currentKPIs);
    Logger.debug('[calculateSharePrice] Previous share price:', previousSharePrice);
    Logger.debug('[calculateSharePrice] Net order effect:', netOrderEffect);
    Logger.debug('[calculateSharePrice] Market sentiment:', marketSentiment);
    Logger.debug('[calculateSharePrice] Sentiment factor:', sentimentFactor);
    Logger.debug('[calculateSharePrice] Share price change percentage:', sharePriceChangePercentage);
    Logger.debug('[calculateSharePrice] New share price:', newSharePrice);
    return { orders, newSharePrice };
}

// Export both functions
export { analyzeKPIs, calculateSharePrice };

// Helper functions to improve readability and reduce duplication
function calculateAverageChange(changes: Change[], property: keyof Change): number {
    return changes.reduce((sum, change) => sum + change[property], 0) / changes.length;
}

/**
 * Determines if there is a consistent trend in a specific KPI.
 * @param changes - Array of Change objects.
 * @param property - The KPI property to check.
 * @param isPositive - True for positive trend, false for negative.
 * @returns True if the trend is consistent, otherwise false.
 */
function isConsistentTrend(changes: Change[], property: keyof Change, isPositive: boolean): boolean {
    return changes.every(change => isPositive ? change[property] > 0 : change[property] < 0);
}

function safeDivide(numerator: number, denominator: number): number {
    return denominator === 0 ? 0 : (numerator - denominator) / denominator;
}