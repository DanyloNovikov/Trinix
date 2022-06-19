
import { CryptoHookFactory } from "@_types/hooks";
import useSWR from "swr";

const NETWORKS: {[k: string]: string} = {
    1: 'Ethereum Main Network',
    3: 'Ropsten Main Network',
    4: 'Rinkenby Main Network',
    5: 'Goerli Main Network',
    42: 'Kovan Main Network',
    56: 'Binance Smart Chain',
    1337: 'Ganache',
}

const targetId = process.env.NEXT_PUBLIC_TARGET_CHAIN_ID as string;
const targetNetwork = NETWORKS[targetId];

type UseNetworkResponse = {
  isLoading: boolean;
  isSupported: boolean;
  targetNetwork: string;
  isConnectedToNetwork: boolean;
}

type NetworkHookFactory = CryptoHookFactory<string, UseNetworkResponse>

export type UseNetworkHook = ReturnType<NetworkHookFactory>

export const hookFactory: NetworkHookFactory = ({provider, isLoading}) => () => {
  const {data, isValidating, ...swr} = useSWR(
    provider ? "web3/useNetwork" : null,
    async () => {
      const chainId = (await provider!.getNetwork()).chainId;

      if (!chainId) {
          throw 'Cannot retreive network, please refresh browser or connect wallet'
      }

      return NETWORKS[chainId];
    }, {
      revalidateOnFocus: false
    }
  )
  
  const _isSupported = data == targetNetwork;
  return {
    ...swr,
    data,
    isValidating,
    targetNetwork,
    isSupported: _isSupported,
    isLoading: isLoading as boolean,
    isConnectedToNetwork: !isLoading && _isSupported
  };
}
