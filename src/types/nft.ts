export interface NFTAttribute {
  trait_type?: string;
  name?: string;
  value: string;
}

export interface NFTMetadata {
  name: string;
  image: string;
  description?: string;
  attributes?: NFTAttribute[];
  background?: {
    color?: string;
    pattern?: string;
    image?: string;
  };
}

export interface NFTCollection {
  address: string;
  name: string;
}

export interface NFT {
  address: string;
  collectionAddress: string;
  metadata: NFTMetadata;
  isStaking: boolean;
  stakingStartTime: number;
}

export interface NFTBackground {
  color: string;
  pattern?: string;
  image?: string;
}

// Поддерживаемые коллекции NFT
export const SUPPORTED_COLLECTIONS: NFTCollection[] = [
  {
    address: "EQC6zjid8vJNEWqcXk10XjsdDLRKbcPZzbHusuEW6FokOWIm",
    name: "Коллекция 1"
  },
  {
    address: "EQD6mH9bwbn6S3M_tCRWOvqAIW8M34kRwbI01niGLRPeDPsl",
    name: "Коллекция 2"
  },
  {
    address: "EQBMcfMAZlMUr1W3X8kdEw3fJMUAaWH4-XcmE5R5RfFIY0E2",
    name: "Коллекция 3"
  },
  {
    address: "EQDQ6DjRabTYSAxf2xrZsnsXtqcIm1bj9dF5x_h8lNjWPmH4",
    name: "Коллекция 4"
  },
  {
    address: "EQCefrjhCD2_7HRIr2lmwt9ZaqeG_tdseBvADC66833kBS3y",
    name: "Коллекция 5"
  },
  {
    address: "EQBD8aBKC4NsnYMqtkCfPQk2EVnieynJQp1UgZVyx1VmR5Ml",
    name: "Коллекция 6"
  },
  {
    address: "EQCBK_JBASAA5XVz1D17Pn--kQaMWm0b9wReVtsEdRO4Tgy9",
    name: "Коллекция 7"
  },
  {
    address: "EQAwzubeoJwnqmmBuTPpnUSurRzWPB8ERzcfzx55Z2YjE0jx",
    name: "Коллекция 8"
  },
  {
    address: "EQCwEFfUbbR-22fn3VgxUpBil7bwBQqEHm7wgQYbWY9c08YJ",
    name: "Коллекция 9"
  },
  {
    address: "EQAaTIR7oJyowDiumYLVN0oe61kGE3I6EPEn7WgHPGuWAeCy",
    name: "Коллекция 10"
  }
]; 