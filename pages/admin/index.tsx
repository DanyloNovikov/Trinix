/* eslint-disable @next/next/no-img-element */

import {NextPage} from "next";
import {useAccount, useNetwork} from '@hooks/web3';
import {useWeb3} from '@providers/web3';
import {css} from "@emotion/react";
import DotLoader from "react-spinners/DotLoader";
import {Fragment, useEffect, useRef, useState} from 'react';
import {Dialog, Transition} from "@headlessui/react";
import {ExclamationIcon} from "@heroicons/react/outline";
import NftListForAdmin from '@ui/nft/list/indexForAdmin';
import {ContractTransaction, ethers} from "ethers";

const override = css`
  display: block;
  margin-left: auto;
  margin-right: auto;
  margin-top: 20%;
`;

const Admin: NextPage = () => {
    const {account} = useAccount();
    const {network} = useNetwork();
    const {contract} = useWeb3();

    const [isLoaded, setIsLoaded] = useState(false);
    const [open, setOpen] = useState(false);

    const cancelButtonRef = useRef(null)


    const [nftsOnSaleCount, setNftsOnSaleCount] = useState();
    const [allNftsCount, setAllNftsCount]       = useState();
    const [totalBalance, setTotalBalance]       = useState();
    const [currentFee, setCurrentFee]           = useState();
    const [ownerAddress, setOwnerAddress]       = useState();

    const getNftsOnSaleCount = async () => {
        try {
            const res: any = await contract!.getAllNftsOnSale()
            setNftsOnSaleCount(res.length);
        } catch (e: any) {
            console.log(e.message);
        }
    }

    const getAllNftsCount = async () => {
        try {
            const res: any = await contract!.totalSupply()
            setAllNftsCount(res.toNumber());
        } catch (e: any) {
            console.log(e.message);
        }
    }

    const getTotalBalance = async () => {
        try {
            const res = await contract!.getTotalBalance()
            const convertRes: any = ethers.utils.formatEther(res.toString());
            setTotalBalance(convertRes);
        } catch (e: any) {
            console.log(e.message);
        }
    }

    const getCurrentFee = async () => {
        try {
            const listingPrice = await contract!.listingPrice();
            const convertRes: any = ethers.utils.formatEther(listingPrice.toString());
            setCurrentFee(convertRes);
        } catch (e: any) {
            console.log(e.message);
        }
    }

    const getOwnerAddress = async () => {
        try {
            const ownerAddress: any = await contract!.owner();
            setOwnerAddress(ownerAddress);
        } catch (e: any) {
            console.log(e.message);
        }
    }
    const fetchContractData = async () => {
        await getCurrentFee();
        await getTotalBalance();
        await getAllNftsCount();
        await getNftsOnSaleCount();
        await getOwnerAddress();
    }
    const setNewOwner = async () => {
        const field: any  = document.getElementById('ownerAddress')
        try {
            await contract!.transferOwnership(field.value);
            field.value = '';
        } catch (e: any) {
            field.value = '';
            console.log(e.message);
        }

    }

    const takeEthereum = async () => {
        const field: any  = document.getElementById('takeEthereumField')
        try {
            await contract!.getMoneyFromPlatform(ethers.utils.parseEther(field.value));
            field.value = '';
        } catch (e: any) {
            field.value = '';
            console.log(e.message);
        }
    }
    const changeFee = async () => {
        const field: any  = document.getElementById('takeFeeField')
        try {
            await contract!.setListingPrice(ethers.utils.parseEther(field.value));
            field.value = '';
        } catch (e: any) {
            field.value = '';
            console.log(e.message);
        }

    }
    const checkOwner = async () => {
        if (account.data === await contract?.owner()) {
            setIsLoaded(true);
        } else {
            window.location.replace(window.location.origin)
        }
    };

    if (contract && account!.data) {
        checkOwner();
    } else if (network.data) {
        window.location.replace(window.location.origin);
    } else {
        return (
            <div className="sweet-loading">
                <DotLoader color="#0369A1" loading={true} css={override} size={150}/>
            </div>
        );
    }

    fetchContractData().catch(console.error);

    return (
        <>
            <div>
                <div className="md:grid md:grid-cols-3 md:gap-6">
                    <div className="md:col-span-1">
                        <div className="px-4 sm:px-0">
                            <div
                                className="shadow sm:rounded-md sm:overflow-hidden px-4 py-5 bg-white space-y-6 sm:p-6 mb-5">
                                <h1 className="text-5xl font-medium leading-1 text-sky-900">Dashboard</h1>
                            </div>
                            <div
                                className="shadow sm:rounded-md sm:overflow-hidden px-4 py-5 bg-white space-y-6 sm:p-6 mb-5">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <h3 className="text-lg font-medium leading-6 text-sky-900">Total
                                            NFTs:</h3>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium leading-6 text-sky-900 pl-10">
                                            {allNftsCount}
                                        </h3>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium leading-6 text-sky-900">Create at
                                            last
                                            day:</h3>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium leading-6 text-sky-900 pl-10">Coming
                                            soon</h3>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="shadow sm:rounded-md sm:overflow-hidden px-4 py-5 bg-white space-y-6 sm:p-6 mb-5">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <h3 className="text-lg font-medium leading-6 text-sky-900">NFTs on
                                            sale:</h3>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium leading-6 text-sky-900 pl-10">
                                            {nftsOnSaleCount}
                                        </h3>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium leading-6 text-sky-900">Sale at
                                            last
                                            day:</h3>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium leading-6 text-sky-900 pl-10">Coming
                                            soon</h3>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="shadow sm:rounded-md sm:overflow-hidden px-4 py-5 bg-white space-y-6 sm:p-6 mb-5">
                                <h3 className="text-lg font-medium leading-6 text-sky-900">Total Ether</h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    The total amount that is stored on the platform. (Ether is transferred
                                    only to
                                    the owner wallet) </p>
                                <div className="flex">
                                    <div className="flex-initial w-64">
                                        <input
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-sky-900 leading-tight focus:outline-none focus:shadow-outline"
                                            id="takeEthereumField" type="number" placeholder={totalBalance}/>
                                    </div>
                                    <div className="flex-initial w-32">
                                        <button
                                            onClick={takeEthereum}
                                            type="button"
                                            className="py-2 ml-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-900 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-900">
                                            Take
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="shadow sm:rounded-md sm:overflow-hidden px-4 py-5 bg-white space-y-6 sm:p-6 mb-5">
                                <h3 className="text-lg font-medium leading-6 text-sky-900">Fee</h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    Price in the ether how much does it cost to place NFTs on the
                                    marketplace.
                                </p>
                                <div className="flex">
                                    <div className="flex-initial w-64">
                                        <input
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-sky-900 leading-tight focus:outline-none focus:shadow-outline"
                                            id="takeFeeField" type="number" placeholder={currentFee}/>
                                    </div>
                                    <div className="flex-initial w-32">
                                        <button
                                            type="button"
                                            className="py-2 ml-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-900 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-900"
                                            onClick={changeFee}>
                                            Set
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 md:mt-0 md:col-span-2">
                        <div
                            className="shadow sm:rounded-md sm:overflow-hidden px-4 py-5 bg-white space-y-6 sm:p-6 mb-5">
                            <h1 className="text-lg text-center text-2xl leading-6 pb-3 text-sky-900">
                                Review
                            </h1>

                            <hr/>

                            {network.isConnectedToNetwork ?
                                <NftListForAdmin/> :
                                <div className="rounded-md bg-yellow-50 p-4 mt-10">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <ExclamationIcon className="h-5 w-5 text-yellow-400"
                                                             aria-hidden="true"/>
                                        </div>

                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-yellow-800">Attention
                                                needed</h3>
                                            <div className="mt-2 text-sm text-yellow-700">
                                                <p>
                                                    {network.isLoading ?
                                                        "Loading..." :
                                                        `Connect to ${network.targetNetwork}`
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>

                        <div
                            className="shadow sm:rounded-md sm:overflow-hidden px-4 py-5 bg-white space-y-6 sm:p-6">
                            <h1 className="text-lg text-center text-2xl leading-6 pb-3 text-red-700"> Danger
                                zone
                            </h1>

                            <hr/>

                            <div className="grid grid-cols-2 gap-1">
                                <div className="m-auto">
                                    <h3 className="text-lg pt-3 font-medium leading-6 text-sky-900"> Current
                                        owner</h3>
                                    <p className="mt-1 text-sm pb-3 text-gray-600">
                                        There can only be 1 owner of a resource, you can change the owner of
                                        a
                                        resource but be careful.
                                    </p>
                                </div>
                                <div className="m-auto">
                                    <button
                                        onClick={() => setOpen(true)}
                                        className="py-2 px-4 border border-transparent shadow-sm text-md font-medium rounded-md text-white bg-sky-900 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-900"
                                        type="button" data-modal-toggle="popup-modal">
                                        Change
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <Transition.Root show={open} as={Fragment}>
                <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"/>
                    </Transition.Child>

                    <div className="fixed z-10 inset-0 overflow-y-auto">
                        <div
                            className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel
                                    className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <div className="sm:flex sm:items-start">
                                            <div
                                                className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                                <ExclamationIcon className="h-6 w-6 text-red-600"
                                                                 aria-hidden="true"/>
                                            </div>
                                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                                <Dialog.Title as="h3"
                                                              className="text-lg leading-6 font-medium text-gray-900">
                                                    Change owner
                                                </Dialog.Title>
                                                <div className="mt-2">
                                                    <p className="pb-2 text-sm text-justify text-gray-500">
                                                        Are you sure you want to change the owner of this
                                                        resource ?
                                                        the current owner will lose all access.
                                                        (Make sure the address is entered correctly,
                                                        otherwise you will simply lose access forever).
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p">
                                            <input
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-sky-900 leading-tight focus:outline-none focus:shadow-outline"
                                                id="ownerAddress" type="text"
                                                placeholder={ownerAddress}/>
                                        </div>
                                    </div>
                                    <div
                                        className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button
                                            type="button"
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                            onClick={setNewOwner}
                                        >
                                            Update
                                        </button>
                                        <button
                                            type="button"
                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                            onClick={() => setOpen(false)}
                                            ref={cancelButtonRef}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </>)
}

export default Admin;
