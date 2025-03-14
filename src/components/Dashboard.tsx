import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTonConnect } from '../hooks/useTonConnect';
import { useTonConnectUI } from '@tonconnect/ui-react';
import NFTService from '../services/nft';
import SubscriptionService from '../services/subscription';
import { NFT } from '../types/nft';
import NFTCard from './NFTCard';
import SubscriptionPanel from './SubscriptionPanel';
import StatsPanel from './StatsPanel';
import Logo from './Logo';

interface DashboardProps {
  onError?: (error: Error) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onError }) => {
  const navigate = useNavigate();
  const { connected, wallet } = useTonConnect();
  const [tonConnectUI] = useTonConnectUI();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [totalGift, setTotalGift] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'farming'>('all');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  // Загрузка NFT
  const loadNFTs = async () => {
    if (!wallet?.address) return;
    
    try {
      setIsLoading(true);
      console.log('Загрузка NFT для адреса:', wallet.address);
      const userNFTs = await NFTService.getUserNFTs(wallet.address);
      console.log('Загруженные NFT:', userNFTs);
      setNfts(userNFTs);
    } catch (error) {
      console.error('Ошибка при загрузке NFT:', error);
      if (onError) {
        onError(error as Error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Обновление общего баланса GIFT
  const updateTotalGift = async () => {
    if (!nfts.length) return;
    try {
      // Получаем накопленные GIFT с активных фармов
      const farmingTotal = await Promise.all(
        nfts.map(nft => NFTService.getAccumulatedGift(nft.address))
      );
      // Получаем общий баланс GIFT
      const totalBalance = NFTService.getGiftBalance() + farmingTotal.reduce((sum, amount) => sum + amount, 0);
      setTotalGift(totalBalance);
    } catch (error) {
      console.error('Ошибка при обновлении баланса:', error);
      if (onError) {
        onError(error as Error);
      }
    }
  };

  // Обновление состояния NFT
  const updateNFTState = (nftAddress: string, isStaking: boolean) => {
    setNfts(prevNfts => 
      prevNfts.map(nft => 
        nft.address === nftAddress 
          ? { ...nft, isStaking, stakingStartTime: isStaking ? Date.now() : 0 }
          : nft
      )
    );
  };

  // Подписка на премиум
  const handleSubscribe = async () => {
    try {
      await SubscriptionService.subscribe(tonConnectUI);
      // Обновляем UI после успешной оплаты
      window.location.reload();
    } catch (error) {
      console.error('Ошибка при оформлении подписки:', error);
      if (onError) {
        onError(error as Error);
      }
    }
  };

  // Запуск фарминга для всех NFT
  const handleStartAllFarming = async () => {
    try {
      await NFTService.startAllFarming(nfts);
      // Обновляем только те NFT, которые не были в процессе фарминга
      setNfts(prevNfts => 
        prevNfts.map(nft => {
          const farmingData = NFTService.getFarmingState(nft.address);
          return farmingData?.isStaking
            ? { ...nft, isStaking: true, stakingStartTime: farmingData.startTime }
            : nft;
        })
      );
      updateTotalGift();
    } catch (error) {
      console.error('Ошибка при запуске всех NFT:', error);
      if (onError) {
        onError(error as Error);
      }
    }
  };

  // Сбор наград со всех NFT
  const handleCollectAllRewards = async () => {
    try {
      const totalCollected = await NFTService.collectAllRewards(nfts);
      if (totalCollected > 0) {
        // Обновляем только те NFT, с которых собрали награду
        setNfts(prevNfts => 
          prevNfts.map(nft => {
            const farmingData = NFTService.getFarmingState(nft.address);
            return !farmingData?.isStaking
              ? { ...nft, isStaking: false, stakingStartTime: 0 }
              : nft;
          })
        );
        updateTotalGift();
      }
    } catch (error) {
      console.error('Ошибка при сборе всех наград:', error);
      if (onError) {
        onError(error as Error);
      }
    }
  };

  useEffect(() => {
    if (connected && wallet?.address) {
      console.log('Кошелек подключен:', wallet.address);
      loadNFTs();
      setIsSubscribed(SubscriptionService.isSubscribed());
    } else {
      console.log('Кошелек не подключен');
    }
  }, [connected, wallet?.address]);

  useEffect(() => {
    if (nfts.length > 0) {
      updateTotalGift();
      const interval = setInterval(updateTotalGift, 2000);
      return () => clearInterval(interval);
    }
  }, [nfts]);

  const farmingNFTs = nfts.filter(nft => nft.isStaking);

  const handleConnect = async () => {
    if (isConnecting || connected) return;
    
    try {
      setIsConnecting(true);
      await tonConnectUI.connectWallet();
      navigate('/dashboard');
    } catch (error) {
      console.error('Ошибка подключения:', error);
      if (onError) {
        onError(error as Error);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="backdrop-blur-lg bg-white/5 p-8 rounded-2xl border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 max-w-md w-full transform hover:scale-[1.02]">
          <div className="flex justify-center mb-8">
            <Logo />
          </div>
          <h1 className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            GIFT Farm
          </h1>
          <p className="text-gray-300 text-center text-lg mb-8 animate-fade-in">
            Подключите TON Keeper для доступа к фармингу
          </p>
          <div className="flex justify-center">
            <button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-medium w-full max-w-xs hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? 'Подключение...' : 'Подключить кошелёк'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-2 sm:py-6">
      <div className="container mx-auto px-2 sm:px-4 max-w-4xl">
        {/* Информационная панель */}
        <div className="backdrop-blur-lg bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 p-4 sm:p-6 mb-4 sm:mb-6 shadow-xl">
          <StatsPanel
            totalGift={totalGift}
            totalNFTs={nfts.length}
            farmingNFTs={farmingNFTs.length}
            isSubscribed={isSubscribed}
          />
        </div>

        {/* Панель подписки */}
        <div className="backdrop-blur-lg bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 p-4 sm:p-6 mb-4 sm:mb-6 shadow-xl">
          <SubscriptionPanel
            isSubscribed={isSubscribed}
            onSubscribe={handleSubscribe}
            onStartAllFarming={handleStartAllFarming}
            onCollectAllRewards={handleCollectAllRewards}
            farmingCount={farmingNFTs.length}
            totalNFTs={nfts.length}
          />
        </div>

        {/* Табы */}
        <div className="flex space-x-2 mb-4 sm:mb-6 overflow-x-auto pb-2 sm:pb-0">
          <button 
            className={`px-3 sm:px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 whitespace-nowrap ${
              selectedTab === 'all' 
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30' 
                : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
            }`}
            onClick={() => setSelectedTab('all')}
          >
            Все NFT ({nfts.length})
          </button>
          <button 
            className={`px-3 sm:px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 whitespace-nowrap ${
              selectedTab === 'farming' 
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30' 
                : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
            }`}
            onClick={() => setSelectedTab('farming')}
          >
            Фармятся ({farmingNFTs.length})
          </button>
        </div>

        {/* Загрузка */}
        {isLoading && (
          <div className="backdrop-blur-lg bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 p-6 sm:p-8 text-center animate-fade-in">
            <div className="inline-block animate-bounce">
              <svg className="animate-spin h-12 sm:h-16 w-12 sm:w-16 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-gray-300 mt-4 sm:mt-6 text-base sm:text-lg animate-pulse">Загрузка NFT...</p>
          </div>
        )}

        {/* Пустое состояние */}
        {!isLoading && nfts.length === 0 && (
          <div className="backdrop-blur-lg bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 p-6 sm:p-8 text-center animate-fade-in">
            <svg className="mx-auto h-16 sm:h-24 w-16 sm:w-24 text-gray-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-300 mt-4 sm:mt-6 text-lg sm:text-xl">
              У вас нет NFT, подходящих для фарминга
            </p>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">
              Приобретите NFT из поддерживаемых коллекций
            </p>
          </div>
        )}

        {/* Сетка NFT */}
        {!isLoading && nfts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {(selectedTab === 'all' ? nfts : farmingNFTs).map((nft) => (
              <NFTCard
                key={nft.address}
                nft={nft}
                onStartFarming={() => updateNFTState(nft.address, true)}
                onCollectRewards={() => updateNFTState(nft.address, false)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 