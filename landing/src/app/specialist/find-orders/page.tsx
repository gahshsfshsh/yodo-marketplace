'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Briefcase,
  User,
  ChevronDown,
  ArrowRight,
  Bell,
  TrendingUp,
  Award
} from 'lucide-react';

interface Order {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: { min: number; max: number } | number;
  location: string;
  deadline: string;
  postedAt: string;
  client: {
    name: string;
    rating: number;
    ordersCount: number;
    verified: boolean;
  };
  responses: number;
  urgency: 'low' | 'medium' | 'high';
  matchScore?: number; // Процент соответствия компетенциям специалиста
}

const mockOrders: Order[] = [
  {
    id: '1',
    title: 'Замена электропроводки в квартире 65 м²',
    description: 'Нужен опытный электрик для полной замены проводки в трёхкомнатной квартире. Работа включает: демонтаж старой проводки, прокладку новой, установку щитка, розеток и выключателей.',
    category: 'Электрика',
    budget: { min: 45000, max: 65000 },
    location: 'Москва, Тверской район',
    deadline: '2025-02-10',
    postedAt: '2025-01-01T10:30:00',
    client: {
      name: 'Анна Петрова',
      rating: 4.9,
      ordersCount: 12,
      verified: true
    },
    responses: 5,
    urgency: 'high',
    matchScore: 95
  },
  {
    id: '2',
    title: 'Косметический ремонт однокомнатной квартиры',
    description: 'Требуется косметический ремонт: поклейка обоев, покраска потолка, замена плинтусов, укладка ламината. Площадь 40 м².',
    category: 'Ремонт квартир',
    budget: 120000,
    location: 'Москва, СЗАО',
    deadline: '2025-02-15',
    postedAt: '2025-01-01T09:15:00',
    client: {
      name: 'Дмитрий Иванов',
      rating: 5.0,
      ordersCount: 8,
      verified: true
    },
    responses: 12,
    urgency: 'medium',
    matchScore: 88
  },
  {
    id: '3',
    title: 'Дизайн-проект кухни 15 м²',
    description: 'Нужен дизайн-проект кухни с 3D визуализацией. Современный стиль, светлые тона. Готовый проект нужен через 2 недели.',
    category: 'Дизайн интерьера',
    budget: { min: 30000, max: 50000 },
    location: 'Москва, ЦАО',
    deadline: '2025-01-15',
    postedAt: '2025-01-01T08:00:00',
    client: {
      name: 'Мария Сидорова',
      rating: 4.7,
      ordersCount: 5,
      verified: false
    },
    responses: 8,
    urgency: 'high',
    matchScore: 92
  },
  {
    id: '4',
    title: 'Установка сантехники в ванной комнате',
    description: 'Установка новой сантехники: ванна, унитаз, раковина, смесители. Демонтаж старой сантехники включён.',
    category: 'Сантехника',
    budget: 35000,
    location: 'Москва, ЮВАО',
    deadline: '2025-02-05',
    postedAt: '2024-12-31T16:45:00',
    client: {
      name: 'Сергей Николаев',
      rating: 4.8,
      ordersCount: 15,
      verified: true
    },
    responses: 3,
    urgency: 'medium',
    matchScore: 75
  }
];

const categories = [
  'Все категории',
  'Электрика',
  'Сантехника',
  'Ремонт квартир',
  'Дизайн интерьера',
  'Строительство',
  'Кровельные работы'
];

export default function FindOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все категории');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 200000 });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'match' | 'date' | 'price' | 'responses'>('match');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const filteredOrders = orders
    .filter(order => {
      if (searchQuery && !order.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (selectedCategory !== 'Все категории' && order.category !== selectedCategory) {
        return false;
      }
      const orderPrice = typeof order.budget === 'number' ? order.budget : order.budget.max;
      if (orderPrice < priceRange.min || orderPrice > priceRange.max) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'match':
          return (b.matchScore || 0) - (a.matchScore || 0);
        case 'date':
          return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
        case 'price':
          const priceA = typeof a.budget === 'number' ? a.budget : a.budget.max;
          const priceB = typeof b.budget === 'number' ? b.budget : b.budget.max;
          return priceB - priceA;
        case 'responses':
          return a.responses - b.responses;
        default:
          return 0;
      }
    });

  const getUrgencyBadge = (urgency: Order['urgency']) => {
    const badges = {
      low: { label: 'Не срочно', className: 'bg-gray-100 text-gray-700' },
      medium: { label: 'Средний приоритет', className: 'bg-yellow-100 text-yellow-700' },
      high: { label: 'Срочно!', className: 'bg-red-100 text-red-700' }
    };
    return badges[urgency];
  };

  const getBudgetDisplay = (budget: Order['budget']) => {
    if (typeof budget === 'number') {
      return `${budget.toLocaleString()} ₽`;
    }
    return `${budget.min.toLocaleString()} - ${budget.max.toLocaleString()} ₽`;
  };

  const handleEnableNotifications = async () => {
    // TODO: Интеграция с Push Notifications Service
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        // Здесь подписываемся на Push уведомления
        console.log('Push notifications enabled');
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              YoDo
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link href="/specialist/dashboard" className="text-gray-600 hover:text-gray-900">
                Мои заказы
              </Link>
              <Link href="/specialist/find-orders" className="text-primary-600 font-medium">
                Поиск заказов
              </Link>
              <Link href="/specialist/messages" className="text-gray-600 hover:text-gray-900">
                Сообщения
              </Link>
            </nav>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Найдите заказы по вашим компетенциям
          </h1>
          <p className="text-lg text-gray-600">
            {filteredOrders.length} заказов доступны сейчас
          </p>
        </div>

        {/* Notification Banner */}
        {!notificationsEnabled && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white mb-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <Bell className="w-10 h-10" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Включите уведомления</h3>
                <p className="text-blue-100 text-sm">
                  Получайте мгновенные уведомления о новых заказах по вашим компетенциям
                </p>
              </div>
            </div>
            <button
              onClick={handleEnableNotifications}
              className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors flex-shrink-0"
            >
              Включить
            </button>
          </motion.div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск заказов..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 border-2 border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Фильтры
              <ChevronDown className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-200 pt-4 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Бюджет: {priceRange.min.toLocaleString()} - {priceRange.max.toLocaleString()} ₽
                </label>
                <div className="flex gap-4">
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    step="10000"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    step="10000"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Сортировать по:
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { value: 'match', label: 'Соответствию', icon: <TrendingUp className="w-4 h-4" /> },
                    { value: 'date', label: 'Дате', icon: <Clock className="w-4 h-4" /> },
                    { value: 'price', label: 'Цене', icon: <DollarSign className="w-4 h-4" /> },
                    { value: 'responses', label: 'Откликам', icon: <User className="w-4 h-4" /> }
                  ].map(sort => (
                    <button
                      key={sort.value}
                      onClick={() => setSortBy(sort.value as typeof sortBy)}
                      className={`
                        px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2
                        ${sortBy === sort.value
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      {sort.icon}
                      {sort.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Orders Grid */}
        <div className="space-y-4">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {order.matchScore && order.matchScore >= 90 && (
                        <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" />
                          {order.matchScore}% соответствие
                        </div>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyBadge(order.urgency).className}`}>
                        {getUrgencyBadge(order.urgency).label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(order.postedAt).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{order.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{order.description}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {order.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {order.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        До {new Date(order.deadline).toLocaleDateString('ru-RU')}
                      </span>
                      <span className="text-orange-600 font-medium">
                        {order.responses} откликов
                      </span>
                    </div>
                  </div>

                  <div className="text-right ml-6">
                    <div className="text-2xl font-bold text-primary-600 mb-1">
                      {getBudgetDisplay(order.budget)}
                    </div>
                    <div className="text-xs text-gray-500">Бюджет</div>
                  </div>
                </div>

                {/* Client Info */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{order.client.name}</span>
                        {order.client.verified && (
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        {order.client.rating}
                        <span>•</span>
                        <span>{order.client.ordersCount} заказов</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/specialist/orders/${order.id}`}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
                  >
                    Откликнуться
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Заказы не найдены
            </h3>
            <p className="text-gray-500 mb-6">
              Попробуйте изменить фильтры или поисковый запрос
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Все категории');
                setPriceRange({ min: 0, max: 200000 });
              }}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
            >
              Сбросить фильтры
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

