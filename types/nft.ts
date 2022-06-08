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
