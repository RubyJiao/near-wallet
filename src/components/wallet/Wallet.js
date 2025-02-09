import React, { useState, useEffect } from 'react';
import { Translate } from 'react-localize-redux';
import { useSelector, useDispatch } from 'react-redux';
import { Textfit } from 'react-textfit';
import styled from 'styled-components';

import { handleGetTokens } from '../../actions/tokens';
import { getTransactions, getTransactionStatus } from '../../actions/transactions';
import { useFungibleTokensIncludingNEAR } from '../../hooks/fungibleTokensIncludingNEAR';
import { Mixpanel } from "../../mixpanel/index";
import { selectAccountId, selectBalance } from '../../reducers/account';
import { selectTokensWithMetadataForAccountId, actions as nftActions } from '../../reducers/nft';
import { selectTransactions } from '../../reducers/transactions';
import { actionsPendingByPrefix } from '../../utils/alerts';
import classNames from '../../utils/classNames';
import { SHOW_NETWORK_BANNER } from '../../utils/wallet';
import Balance from '../common/balance/Balance';
import FormButton from '../common/FormButton';
import Container from '../common/styled/Container.css';
import Tooltip from '../common/Tooltip';
import BuyIcon from '../svg/BuyIcon';
import DownArrowIcon from '../svg/DownArrowIcon';
import SendIcon from '../svg/SendIcon';
import Activities from './Activities';
import ExploreApps from './ExploreApps';
import LinkDropSuccessModal from './LinkDropSuccessModal';
import NFTs from './NFTs';
import Tokens from './Tokens';

const { fetchNFTs } = nftActions;

const StyledContainer = styled(Container)`
    @media (max-width: 991px) {
        margin: -5px auto 0 auto;

        &.showing-banner {
            margin-top: -15px;
        }
    }

    .sub-title {
        font-size: 14px;
        margin-bottom: 10px;

        &.balance {
            font-weight: 600;
            color: #272729;
        }

        &.tokens {
            color: #72727A;
            margin-top: 40px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            max-width: unset;

            @media (min-width: 768px) {
                padding: 0 20px;
            }

            .dots {
                :after {
                    position: absolute;
                    content: '.';
                    animation: link 1s steps(5, end) infinite;

                    @keyframes link {
                        0%, 20% {
                            color: rgba(0, 0, 0, 0);
                            text-shadow: .3em 0 0 rgba(0, 0, 0, 0),
                            .6em 0 0 rgba(0, 0, 0, 0);
                        }
                        40% {
                            color: #24272a;
                            text-shadow: .3em 0 0 rgba(0, 0, 0, 0),
                            .6em 0 0 rgba(0, 0, 0, 0);
                        }
                        60% {
                            text-shadow: .3em 0 0 #24272a,
                            .6em 0 0 rgba(0, 0, 0, 0);
                        }
                        80%, 100% {
                            text-shadow: .3em 0 0 #24272a,
                            .6em 0 0 #24272a;
                        }
                    }
                }
            }
        }
    }

    .left {
        display: flex;
        flex-direction: column;
        align-items: center;

        > svg {
            margin-top: 25px;
        }

        .total-balance {
            margin: 0px 0 10px 0;
            width: 100%;
            font-weight: 600;
            text-align: center;
            color: #24272a;
        }

        .available-balance {
            display: flex;
            align-items: center;
            color: #72727A;
            text-transform: capitalize;

            > div {
                :first-of-type {
                    margin-right: 5px;
                }
            }
        }

        @media (min-width: 992px) {
            border: 2px solid #F0F0F0;
            border-radius: 8px;
            height: max-content;
        }

        .buttons {
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 30px 0;
            width: 100%;

            button {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                width: auto;
                height: auto;
                background-color: transparent !important;
                border: 0;
                padding: 0;
                color: #3F4045;
                font-weight: 400;
                font-size: 14px;
                margin: 20px;
                border-radius: 0;

                :hover {
                    color: #3F4045;

                    > div {
                        background-color: black;
                    }
                }

                > div {
                    background-color: #272729;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 56px;
                    height: 56px;
                    min-width: 56px;
                    width: 56px;
                    border-radius: 20px;
                    margin-bottom: 10px;
                    transition: 100ms;
                }

                svg {
                    width: 22px !important;
                    height: 22px !important;
                    margin: 0 !important;

                    path {
                        stroke: white;
                    }
                }
            }
        }

        .tab-selector {
            width: 100%;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            justify-content: space-around;

            > div {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 25px 0;
                border-bottom: 1px solid transparent;
                color: black;
                font-weight: 600;
                font-size: 16px;

                &.inactive {
                    background-color: #FAFAFA;
                    border-bottom: 1px solid #F0F0F1;
                    cursor: pointer;
                    color: #A2A2A8;
                    transition: color 100ms;

                    :hover {
                        color: black;
                    }
                }
            }

            .tab-balances {
                border-right: 1px solid transparent;

                @media (max-width: 767px) {
                    margin-left: -14px;
                }

                @media (min-width: 992px) {
                    border-top-left-radius: 8px;
                }

                &.inactive {
                    border-right: 1px solid #F0F0F1;
                }
            }

            .tab-collectibles {
                border-left: 1px solid transparent;

                @media (max-width: 767px) {
                    margin-right: -14px;
                }

                @media (min-width: 992px) {
                    border-top-right-radius: 8px;
                }

                &.inactive {
                    border-left: 1px solid #F0F0F1;
                }
            }
        }
    }

    button {
        &.gray-blue {
            width: 100% !important;
            margin-top: 35px !important;
        }
    }

    h2 {
        font-weight: 900 !important;
        font-size: 22px !important;
        align-self: flex-start;
        margin: 50px 0 30px 0;
        text-align: left !important;
        color: #24272a !important;
    }
`;

export function Wallet({ tab, setTab }) {
    const [exploreApps, setExploreApps] = useState(null);
    const [showLinkdropModal, setShowLinkdropModal] = useState(null);
    const accountId = useSelector(state => selectAccountId(state));
    const balance = useSelector(state => selectBalance(state));
    const transactions = useSelector(state => selectTransactions(state));
    const dispatch = useDispatch();
    const hideExploreApps = localStorage.getItem('hideExploreApps');
    const linkdropAmount = localStorage.getItem('linkdropAmount');
    const linkdropModal = linkdropAmount && showLinkdropModal !== false;
    const fungibleTokensList = useFungibleTokensIncludingNEAR({ fullBalance: true });
    const tokensLoader = actionsPendingByPrefix('TOKENS/') || !balance?.total;

    useEffect(() => {
        if (accountId) {
            let id = Mixpanel.get_distinct_id();
            Mixpanel.identify(id);
            Mixpanel.people.set({ relogin_date: new Date().toString() });
            dispatch(getTransactions(accountId));
        }
    }, [accountId]);


    const sortedNFTs = useSelector((state) => selectTokensWithMetadataForAccountId(state, { accountId }));

    useEffect(() => {
        if (!accountId) {
            return;
        }

        dispatch(handleGetTokens());
        dispatch(fetchNFTs({ accountId }));
    }, [accountId]);

    const handleHideExploreApps = () => {
        localStorage.setItem('hideExploreApps', true);
        setExploreApps(false);
        Mixpanel.track("Click explore apps dismiss");
    };

    const handleCloseLinkdropModal = () => {
        localStorage.removeItem('linkdropAmount');
        setShowLinkdropModal(false);
        Mixpanel.track("Click dismiss NEAR drop success modal");
    };

    return (
        <StyledContainer className={SHOW_NETWORK_BANNER ? 'showing-banner' : ''}>
            <div className='split'>
                <div className='left'>
                    <div className='tab-selector'>
                        <div
                            className={classNames(['tab-balances', tab === 'collectibles' ? 'inactive' : ''])}
                            onClick={() => setTab('')}
                        >
                            <Translate id='wallet.balances'/>
                        </div>
                        <div
                            className={classNames(['tab-collectibles', tab !== 'collectibles' ? 'inactive' : ''])}
                            onClick={() => setTab('collectibles')}
                        >
                            <Translate id='wallet.collectibles'/>
                        </div>
                    </div>
                    {tab === 'collectibles'
                        ? <NFTs tokens={sortedNFTs}/>
                        : <FungibleTokens
                            balance={balance}
                            tokensLoader={tokensLoader}
                            fungibleTokens={fungibleTokensList}
                        />

                    }
                </div>
                <div className='right'>
                    {!hideExploreApps && exploreApps !== false &&
                    <ExploreApps onClick={handleHideExploreApps}/>
                    }
                    <Activities
                        transactions={transactions[accountId] || []}
                        accountId={accountId}
                        getTransactionStatus={getTransactionStatus}

                    />
                </div>
            </div>
            {linkdropModal &&
            <LinkDropSuccessModal
                onClose={handleCloseLinkdropModal}
                open={linkdropModal}
                linkdropAmount={linkdropAmount}
            />
            }
        </StyledContainer>
    );
}

const FungibleTokens = ({ balance, tokensLoader, fungibleTokens }) => {
    return (
        <>
            <div className='sub-title balance'><Translate id='wallet.totalBalanceTitle' /></div>
            <div className='total-balance'>
                <Textfit mode='single' max={44}>
                    <Balance
                        showBalanceInNEAR={false}
                        amount={balance?.total}
                        showAlmostEqualSignUSD={false}
                        showSymbolUSD={false}
                        showSignUSD={true}
                    />
                </Textfit>
            </div>
            <div className='available-balance'>
                <div><Translate id='balanceBreakdown.available' />:</div>
                <Balance
                    showBalanceInNEAR={false}
                    amount={balance?.available}
                    showAlmostEqualSignUSD={false}
                    showSymbolUSD={false}
                    showSignUSD={true}
                />
                <Tooltip translate='availableBalanceInfo'/>
            </div>
            <div className='buttons'>
                <FormButton
                    color='dark-gray'
                    linkTo='/send-money'
                    trackingId='Click Send on Wallet page'
                >
                    <div>
                        <SendIcon/>
                    </div>
                    <Translate id='button.send'/>
                </FormButton>
                <FormButton
                    color='dark-gray'
                    linkTo='/receive-money'
                    trackingId='Click Receive on Wallet page'
                >
                    <div>
                        <DownArrowIcon/>
                    </div>
                    <Translate id='button.receive'/>
                </FormButton>
                <FormButton
                    color='dark-gray'
                    linkTo='/buy'
                    trackingId='Click Receive on Wallet page'
                >
                    <div>
                        <BuyIcon/>
                    </div>
                    <Translate id='button.buy'/>
                </FormButton>
            </div>
            <div className='sub-title tokens'>
                <span className={classNames({ dots: tokensLoader })}><Translate id='wallet.tokens'/></span>
                <span><Translate id='wallet.totalBalance'/></span>
            </div>
            <Tokens tokens={fungibleTokens}/>
        </>
    );
};