export type Trait = 'attack' | 'health' | 'speed';

export type NftAttributes = {
    trait_type: Trait;
    value: string;
}

export type NftMeta = {
    id: number;
    name: string;
    description: string;
    image: string;
    attributes: NftAttributes[]
}

export type NftCore = {
    tokenId: number;
    price: number;
    creator: string;
    isListed: boolean;
}

export type Nft = {
    meta: NftMeta
} & NftCore