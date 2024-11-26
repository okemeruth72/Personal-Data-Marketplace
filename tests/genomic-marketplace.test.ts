import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the blockchain state
let genomicData: Map<number, any> = new Map();
let dataAccess: Map<string, any> = new Map();
let nextDataId = 0;

// Mock contract functions
const registerGenomicData = (owner: string, description: string, price: number) => {
  const dataId = nextDataId++;
  genomicData.set(dataId, { owner, description, price });
  return dataId;
};

const grantAccess = (owner: string, dataId: number, recipient: string, duration: number) => {
  const data = genomicData.get(dataId);
  if (!data) {
    throw new Error('ERR-NOT-FOUND');
  }
  if (data.owner !== owner) {
    throw new Error('ERR-UNAUTHORIZED');
  }
  const accessKey = `${dataId}-${recipient}`;
  dataAccess.set(accessKey, {
    granted: true,
    expiration: Date.now() + duration * 1000 // Convert duration to milliseconds
  });
  return true;
};

const checkAccess = (dataId: number, user: string) => {
  const accessKey = `${dataId}-${user}`;
  const access = dataAccess.get(accessKey);
  if (!access || !access.granted) {
    throw new Error('ERR-UNAUTHORIZED');
  }
  if (access.expiration < Date.now()) {
    throw new Error('ERR-EXPIRED');
  }
  return true;
};

const purchaseData = (buyer: string, dataId: number, payment: number) => {
  const data = genomicData.get(dataId);
  if (!data) {
    throw new Error('ERR-NOT-FOUND');
  }
  if (payment < data.price) {
    throw new Error('ERR-INSUFFICIENT-FUNDS');
  }
  // In a real implementation, we would transfer the payment to the owner
  return true;
};

describe('Genomic Marketplace Contract', () => {
  beforeEach(() => {
    genomicData.clear();
    dataAccess.clear();
    nextDataId = 0;
  });
  
  it('should register genomic data', () => {
    const dataId = registerGenomicData('user1', 'My genomic sequence', 1000);
    expect(dataId).toBe(0);
    const data = genomicData.get(dataId);
    expect(data.owner).toBe('user1');
    expect(data.description).toBe('My genomic sequence');
    expect(data.price).toBe(1000);
  });
  
  it('should grant access to genomic data', () => {
    const dataId = registerGenomicData('user1', 'My genomic sequence', 1000);
    const result = grantAccess('user1', dataId, 'user2', 3600); // Grant access for 1 hour
    expect(result).toBe(true);
  });
  
  it('should check access correctly', () => {
    const dataId = registerGenomicData('user1', 'My genomic sequence', 1000);
    grantAccess('user1', dataId, 'user2', 3600);
    const result = checkAccess(dataId, 'user2');
    expect(result).toBe(true);
  });
  
  it('should not allow unauthorized access', () => {
    const dataId = registerGenomicData('user1', 'My genomic sequence', 1000);
    expect(() => checkAccess(dataId, 'user3')).toThrow('ERR-UNAUTHORIZED');
  });
  
  it('should allow purchase of genomic data', () => {
    const dataId = registerGenomicData('user1', 'My genomic sequence', 1000);
    const result = purchaseData('user2', dataId, 1000);
    expect(result).toBe(true);
  });
  
  it('should not allow purchase with insufficient funds', () => {
    const dataId = registerGenomicData('user1', 'My genomic sequence', 1000);
    expect(() => purchaseData('user2', dataId, 500)).toThrow('ERR-INSUFFICIENT-FUNDS');
  });
  
  it('should handle expired access', async () => {
    const dataId = registerGenomicData('user1', 'My genomic sequence', 1000);
    grantAccess('user1', dataId, 'user2', 1); // Grant access for 1 second
    await new Promise(resolve => setTimeout(resolve, 1100)); // Wait for 1.1 seconds
    expect(() => checkAccess(dataId, 'user2')).toThrow('ERR-EXPIRED');
  });
});

