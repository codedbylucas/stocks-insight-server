import type { FetchStockGainsData } from '@/domain/contracts'
import type { StockQuoteAtDate } from '@/domain/models/stock-quote-at-date'
import type { FetchStockQuoteAtDateApi, FetchStockQuoteAtDateApiData } from '@/interactions/contracts/api'
import { FetchStockGainsUseCase } from './fetch-stock-gains-usecase'

const makeFetchStockGainsData = (): FetchStockGainsData => ({
  stockSymbol: 'any_stock_symbol',
  purchasedAt: '2023-01-02',
  purchasedAmount: 1000
})

const makeFakeStockQuoteAtDate = (): StockQuoteAtDate => ({
  name: 'any_stock_symbol',
  pricedAtDate: 130.99,
  quoteDate: '2023-01-02'
})

const makeFetchStockQuoteAtDateApiApi = (): FetchStockQuoteAtDateApi => {
  class FetchStockQuoteAtDateApiStub implements FetchStockQuoteAtDateApi {
    async fetchStockQuoteAtDate (data: FetchStockQuoteAtDateApiData): Promise<null | StockQuoteAtDate> {
      return await Promise.resolve(makeFakeStockQuoteAtDate())
    }
  }
  return new FetchStockQuoteAtDateApiStub()
}

type SutTypes = {
  sut: FetchStockGainsUseCase
  fetchStockQuoteAtDateApiStub: FetchStockQuoteAtDateApi
}

const makeSut = (): SutTypes => {
  const fetchStockQuoteAtDateApiStub = makeFetchStockQuoteAtDateApiApi()
  const sut = new FetchStockGainsUseCase(fetchStockQuoteAtDateApiStub)
  return { sut, fetchStockQuoteAtDateApiStub }
}

describe('FetchStockGains UseCase', () => {
  it('Should call FetchStockQuoteAtDateApi with correct values', async () => {
    const { sut, fetchStockQuoteAtDateApiStub } = makeSut()
    const fetchStockQuoteAtDateSpy = jest.spyOn(fetchStockQuoteAtDateApiStub, 'fetchStockQuoteAtDate')
    await sut.perform(makeFetchStockGainsData())
    expect(fetchStockQuoteAtDateSpy).toHaveBeenCalledWith({
      stockSymbol: 'any_stock_symbol',
      quoteDate: '2023-01-02'
    })
  })
})
