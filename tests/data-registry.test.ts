import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the blockchain state
let dataRecords: Map<number, any> = new Map();
let nextDataId = 0;

// Mock contract functions
const registerData = (sender: string, dataType: string, description: string, price: number) => {
  const dataId = nextDataId++;
  dataRecords.set(dataId, {
    owner: sender,
    dataType,
    description,
    price,
    qualityScore: 0,
    creationDate: Date.now()
  });
  return dataId;
};

const updateDataPrice = (sender: string, dataId: number, newPrice: number) => {
  const data = dataRecords.get(dataId);
  if (!data) {
    throw new Error('ERR-NOT-FOUND');
  }
  if (data.owner !== sender) {
    throw new Error('ERR-UNAUTHORIZED');
  }
  data.price = newPrice;
  dataRecords.set(dataId, data);
  return true;
};

const getDataRecord = (dataId: number) => {
  const data = dataRecords.get(dataId);
  if (!data) {
    throw new Error('ERR-NOT-FOUND');
  }
  return data;
};

const updateQualityScore = (dataId: number, newScore: number) => {
  const data = dataRecords.get(dataId);
  if (!data) {
    throw new Error('ERR-NOT-FOUND');
  }
  data.qualityScore = newScore;
  dataRecords.set(dataId, data);
  return true;
};

describe('Data Registry Contract', () => {
  beforeEach(() => {
    dataRecords.clear();
    nextDataId = 0;
  });
  
  it('should register data successfully', () => {
    const dataId = registerData('user1', 'genomic', 'My genomic data', 100);
    expect(dataId).toBe(0);
    const data = getDataRecord(dataId);
    expect(data.owner).toBe('user1');
    expect(data.dataType).toBe('genomic');
    expect(data.description).toBe('My genomic data');
    expect(data.price).toBe(100);
  });
  
  it('should update data price', () => {
    const dataId = registerData('user1', 'genomic', 'My genomic data', 100);
    const result = updateDataPrice('user1', dataId, 200);
    expect(result).toBe(true);
    const data = getDataRecord(dataId);
    expect(data.price).toBe(200);
  });
  
  it('should not allow unauthorized price update', () => {
    const dataId = registerData('user1', 'genomic', 'My genomic data', 100);
    expect(() => updateDataPrice('user2', dataId, 200)).toThrow('ERR-UNAUTHORIZED');
  });
  
  it('should update quality score', () => {
    const dataId = registerData('user1', 'genomic', 'My genomic data', 100);
    const result = updateQualityScore(dataId, 85);
    expect(result).toBe(true);
    const data = getDataRecord(dataId);
    expect(data.qualityScore).toBe(85);
  });
  
  it('should throw error for non-existent data', () => {
    expect(() => getDataRecord(999)).toThrow('ERR-NOT-FOUND');
  });
});

