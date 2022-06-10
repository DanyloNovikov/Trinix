import {createContext, FunctionComponent, ReactNode, useContext, useEffect, useState} from "react";
import {createDefaultState, createWeb3State, loadContract, Web3State} from './utils';
import { ethers } from 'ethers';

interface BaseLayoutProps {
    children?: ReactNode;
}

// контекст который будет содержать в себе тип данных
// Web3State и в параметры указываем что это именно за данные
const Web3Context = createContext<Web3State>(createDefaultState());

// создаем реакт обьект который будет содержать в себе дочерний элемент
// но для этого нужно указать что па функция будет принимать в себя узел элемента
const Web3Provider: FunctionComponent<BaseLayoutProps> = ({children}) => {

    // создаем state который будет типом Web3State и вызываем
    // метод по созданию дефолтного обьекта с набором инструментов
    const [web3Api, setWeb3Api] = useState<Web3State>(createDefaultState());

    // после прогрузки компонента будет выполнять
    // этот эфект выполнение функции по инициализации web3 провайдера
    useEffect(() => {
        async function initWeb3() {

            // создаем провайдер который будет принимать в себе
            // значения с ethereum провайдера как что угодно будь то нил если что-то пошло не так
            const provider = new ethers.providers.Web3Provider(window.ethereum as any);
            //загружаем наш контракт
            const contract = await loadContract("NftMarket", provider)

            // у нас уже создан state нам нужно создать стейт обьект с набором этих функций
            setWeb3Api(createWeb3State({
                ethereum: window.ethereum,
                provider: provider,
                contract: contract,
                isLoading: false
            }))
        }

        initWeb3();
    }, []);

    return(
        <Web3Context.Provider value={web3Api}>
            {children}
        </Web3Context.Provider>
    );
}

// возвращает hooks из нашего контекста
export function useHooks() {
    const { hooks } = useWeb3();
    return hooks
}

// возврает значение из нашего контекста
export function useWeb3() {
    return useContext(Web3Context);
}

// возврает наш компонент с контекстом который будет
// содержать в себе данные с ethereum, provider, contract, hooks
export default Web3Provider;
