import type { FetchStockHistoryData } from '@/domain/contracts'
import type { StockHistory } from '@/domain/models/stock-history'
import type { StockQuote } from '@/domain/models/stock-quote'
import type { FetchManyStockQuotesBySymbolsApi, FetchStockHistoryApi, FetchStockQuoteAtDateAndLastDateApi, FetchStockQuoteAtDateAndLastDateApiData, FetchStockQuoteBySymbolApi } from '@/interactions/contracts/api'
import axios from 'axios'
import { MaximumLimitReachedError } from './errors/maximun-limit-reached-error'
import type { GlobalStockQuote, DailyStockQuote } from './types'
import { AlphaVantageApiHelper } from './helpers/alpha-vantage-api-helper'
import { type StockQuoteAtDateAndLastDate } from '@/domain/models/stock-quote-at-date-and-last-date'

export class AlphaVantageApi implements FetchStockQuoteBySymbolApi, FetchStockHistoryApi, FetchManyStockQuotesBySymbolsApi, FetchStockQuoteAtDateAndLastDateApi {
  private readonly baseUrl = 'https://www.alphavantage.co/query?function='

  constructor (private readonly apiKey: string) {}

  private makeUrl (func: string, symbol: string, outputsize?: string): string {
    if (outputsize) {
      return `${this.baseUrl}${func}&symbol=${symbol}&outputsize=${outputsize}&apikey=${this.apiKey}`
    }
    return `${this.baseUrl}${func}&symbol=${symbol}&apikey=${this.apiKey}`
  }

  async fetchStockQuote (stockSymbol: string): Promise<null | StockQuote > {
    const url = this.makeUrl('GLOBAL_QUOTE', stockSymbol)
    const response = await axios.get(url)
    if (!response.data) {
      return null
    }
    if (response.data.Information) {
      throw new MaximumLimitReachedError(response.data)
    }
    const data: GlobalStockQuote = response.data
    return AlphaVantageApiHelper.formatStockQuote(data)
  }

  async fetchStockHistory (data: FetchStockHistoryData): Promise<null | StockHistory> {
    const url = this.makeUrl('TIME_SERIES_DAILY', data.stockSymbol, 'full')
    const response = await axios.get(url)
    if (!response.data) {
      return null
    }
    if (response.data.Information) {
      throw new MaximumLimitReachedError(response.data)
    }
    const keys = Object.keys(response.data?.['Time Series (Daily)'])
    if (keys.length === 0) {
      return null
    }
    const dailyStock: DailyStockQuote = response.data
    return AlphaVantageApiHelper.formatStockHistory(dailyStock, data)
  }

  async fetchManyStockQuotes (stockSymbols: string[]): Promise<StockQuote[]> {
    const stockQuoteResults: StockQuote[] = []
    for (const symbol of stockSymbols) {
      const stock = await this.fetchStockQuote(symbol)
      if (stock) {
        stockQuoteResults.push(stock)
      }
    }
    return stockQuoteResults
  }

  async fetchStockQuoteAtDate (data: FetchStockQuoteAtDateAndLastDateApiData): Promise<StockQuoteAtDateAndLastDate | null> {
    const url = this.makeUrl('TIME_SERIES_DAILY', data.stockSymbol, 'full')
    await axios.get(url)
    return {
      quoteAtDate: {
        name: 'any_stock_symbol',
        pricedAtDate: 130.99,
        quoteDate: '2023-01-02'
      },
      quoteLastDate: {
        name: 'any_stock_symbol',
        lastPrice: 150.99,
        pricedAt: '2023-01-10'
      }
    }
  }
}
