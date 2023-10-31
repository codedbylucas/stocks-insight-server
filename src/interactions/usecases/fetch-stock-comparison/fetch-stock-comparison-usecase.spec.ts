import type { StockQuote } from '@/domain/models/stock-quote'
import { type FetchManyStockQuotesBySymbolsApi } from '@/interactions/contracts/api'
import { FetchStockComparisonUseCase } from './fetch-stock-comparison-usecase'
import { NoStockQuoteFoundError } from '@/domain/errors'

const makeFakeStockSymbols = (): string[] => (['any_stock', 'another_stock'])

const makeFakeStockQuotes = (): StockQuote[] => ([{
  name: 'any_stock',
  lastPrice: 120.99,
  pricedAt: 'any_priced_at'
}, {
  name: 'another_stock',
  lastPrice: 133.99,
  pricedAt: 'any_priced_at'
}])

const makeFetchManyStockQuotesBySymbolsApi = (): FetchManyStockQuotesBySymbolsApi => {
  class FetchManyStockQuotesBySymbolsApiStub implements FetchManyStockQuotesBySymbolsApi {
    async fetchManyStockQuotes (stockSymbols: string[]): Promise<StockQuote[]> {
      return await Promise.resolve(makeFakeStockQuotes())
    }
  }
  return new FetchManyStockQuotesBySymbolsApiStub()
}

type SutTypes = {
  sut: FetchStockComparisonUseCase
  fetchManyStockQuotesBySymbolsApiStub: FetchManyStockQuotesBySymbolsApi
}

const makeSut = (): SutTypes => {
  const fetchManyStockQuotesBySymbolsApiStub = makeFetchManyStockQuotesBySymbolsApi()
  const sut = new FetchStockComparisonUseCase(fetchManyStockQuotesBySymbolsApiStub)
  return { sut, fetchManyStockQuotesBySymbolsApiStub }
}

describe('FetchStockComparison UseCase', () => {
  it('Should call FetchManyStockQuotesBySymbolsApi with correct stock symbols', async () => {
    const { sut, fetchManyStockQuotesBySymbolsApiStub } = makeSut()
    const fetchStockQuoteSpy = jest.spyOn(fetchManyStockQuotesBySymbolsApiStub, 'fetchManyStockQuotes')
    await sut.perform(makeFakeStockSymbols())
    expect(fetchStockQuoteSpy).toHaveBeenCalledWith(makeFakeStockSymbols())
  })

  it('Should return NoStockQuoteFoundError if FetchManyStockQuotesBySymbolsApi is empty', async () => {
    const { sut, fetchManyStockQuotesBySymbolsApiStub } = makeSut()
    jest.spyOn(fetchManyStockQuotesBySymbolsApiStub, 'fetchManyStockQuotes').mockReturnValueOnce(
      Promise.resolve([])
    )
    const result = await sut.perform(makeFakeStockSymbols())
    expect(result.value).toEqual(new NoStockQuoteFoundError())
  })

  it('Should throw if FetchManyStockQuotesBySymbolsApi throws', async () => {
    const { sut, fetchManyStockQuotesBySymbolsApiStub } = makeSut()
    jest.spyOn(fetchManyStockQuotesBySymbolsApiStub, 'fetchManyStockQuotes').mockReturnValueOnce(
      Promise.reject(new Error())
    )
    const promise = sut.perform(makeFakeStockSymbols())
    await expect(promise).rejects.toThrow()
  })
})
