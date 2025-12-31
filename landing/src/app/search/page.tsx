'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import SmartSearch from '@/components/ui/smart-search';
import { 
  SlidersHorizontal, Star, MapPin, Clock, TrendingUp, 
  Grid3x3, List, ChevronDown, Award, Shield, Zap 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Specialist {
  id: string;
  name: string;
  title: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  hourlyRate?: number;
  fixedPrice?: number;
  location: string;
  avatar: string;
  verified: boolean;
  topRated: boolean;
  responseTime: string;
  skills: string[];
  availability: 'online' | 'offline' | 'busy';
  description: string;
}

const mockSpecialists: Specialist[] = [
  {
    id: '1',
    name: 'Даниил Крахин',
    title: 'Профессиональный архитектор и проектировщик',
    rating: 4.95,
    reviewCount: 127,
    completedJobs: 200,
    fixedPrice: 150000,
    location: 'Москва',
    avatar: 'ДК',
    verified: true,
    topRated: true,
    responseTime: '1 час',
    skills: ['Проектирование', 'Архитектура', 'AutoCAD', '3D моделирование'],
    availability: 'online',
    description: 'Опыт работы 15+ лет. Специализируюсь на проектировании частных домов и квартир.'
  },
  {
    id: '2',
    name: 'Алексей Иванов',
    title: 'Мастер по ремонту и отделке',
    rating: 4.89,
    reviewCount: 89,
    completedJobs: 156,
    hourlyRate: 2500,
    location: 'Москва',
    avatar: 'АИ',
    verified: true,
    topRated: true,
    responseTime: '30 мин',
    skills: ['Ремонт квартир', 'Отделка', 'Плитка', 'Шпаклевка'],
    availability: 'online',
    description: 'Качественный ремонт под ключ. Гарантия на все работы 2 года.'
  },
  {
    id: '3',
    name: 'Михаил Петров',
    title: 'Электрик с опытом 10+ лет',
    rating: 4.92,
    reviewCount: 64,
    completedJobs: 98,
    hourlyRate: 1800,
    location: 'Москва',
    avatar: 'МП',
    verified: true,
    topRated: false,
    responseTime: '2 часа',
    skills: ['Электрика', 'Проводка', 'Щиты', 'Освещение'],
    availability: 'online',
    description: 'Выполню любые электромонтажные работы. Быстро и качественно.'
  },
  {
    id: '4',
    name: 'Сергей Васильев',
    title: 'Сантехник-универсал',
    rating: 4.87,
    reviewCount: 52,
    completedJobs: 87,
    hourlyRate: 2000,
    location: 'Москва',
    avatar: 'СВ',
    verified: false,
    topRated: false,
    responseTime: '3 часа',
    skills: ['Сантехника', 'Трубы', 'Смесители', 'Унитазы'],
    availability: 'offline',
    description: 'Решу любую сантехническую проблему. Выезд в течение часа.'
  },
  {
    id: '5',
    name: 'Дмитрий Смирнов',
    title: 'Дизайнер интерьеров',
    rating: 4.96,
    reviewCount: 43,
    completedJobs: 65,
    fixedPrice: 80000,
    location: 'Москва',
    avatar: 'ДС',
    verified: true,
    topRated: true,
    responseTime: '1 час',
    skills: ['Дизайн интерьера', '3D визуализация', 'Планировки'],
    availability: 'busy',
    description: 'Создам уникальный дизайн-проект вашей мечты.'
  },
  {
    id: '6',
    name: 'Андрей Козлов',
    title: 'Строитель-универсал',
    rating: 4.84,
    reviewCount: 38,
    completedJobs: 72,
    hourlyRate: 3000,
    location: 'Москва',
    avatar: 'АК',
    verified: true,
    topRated: false,
    responseTime: '4 часа',
    skills: ['Строительство', 'Кладка', 'Бетон', 'Фундамент'],
    availability: 'online',
    description: 'Строительство домов, бань, гаражей. Опыт 12 лет.'
  },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';

  const [specialists, setSpecialists] = useState<Specialist[]>(mockSpecialists);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [filters, setFilters] = useState({
    minRating: 0,
    maxPrice: Infinity,
    verified: false,
    topRated: false,
    availability: 'all' as 'all' | 'online' | 'offline' | 'busy',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort specialists
  useEffect(() => {
    let filtered = mockSpecialists.filter(s => {
      if (filters.minRating && s.rating < filters.minRating) return false;
      if (filters.verified && !s.verified) return false;
      if (filters.topRated && !s.topRated) return false;
      if (filters.availability !== 'all' && s.availability !== filters.availability) return false;
      if (filters.maxPrice !== Infinity) {
        const price = s.hourlyRate || s.fixedPrice || 0;
        if (price > filters.maxPrice) return false;
      }
      
      // Search in name, title, skills
      if (query) {
        const searchLower = query.toLowerCase();
        return (
          s.name.toLowerCase().includes(searchLower) ||
          s.title.toLowerCase().includes(searchLower) ||
          s.skills.some(skill => skill.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    });

    // Sort
    if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'price_low') {
      filtered.sort((a, b) => {
        const priceA = a.hourlyRate || a.fixedPrice || 0;
        const priceB = b.hourlyRate || b.fixedPrice || 0;
        return priceA - priceB;
      });
    } else if (sortBy === 'price_high') {
      filtered.sort((a, b) => {
        const priceA = a.hourlyRate || a.fixedPrice || 0;
        const priceB = b.hourlyRate || b.fixedPrice || 0;
        return priceB - priceA;
      });
    } else if (sortBy === 'reviews') {
      filtered.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    setSpecialists(filtered);
  }, [query, filters, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Search Bar */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <SmartSearch 
            placeholder="Уточните поиск..."
            showFilters={true}
          />
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className={`
            ${showFilters ? 'block' : 'hidden'} lg:block
            w-full lg:w-64 flex-shrink-0
          `}>
            <div className="sticky top-24 space-y-4">
              {/* Filter Header */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5" />
                    Фильтры
                  </h3>
                  <button
                    onClick={() => setFilters({
                      minRating: 0,
                      maxPrice: Infinity,
                      verified: false,
                      topRated: false,
                      availability: 'all',
                    })}
                    className="text-xs text-teal-600 hover:text-teal-700"
                  >
                    Сбросить
                  </button>
                </div>

                {/* Rating Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Минимальный рейтинг
                  </label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => setFilters({ ...filters, minRating: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value={0}>Любой</option>
                    <option value={4}>4+ звезды</option>
                    <option value={4.5}>4.5+ звезды</option>
                    <option value={4.8}>4.8+ звезды</option>
                  </select>
                </div>

                {/* Price Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Максимальная цена
                  </label>
                  <select
                    value={filters.maxPrice === Infinity ? 'all' : filters.maxPrice}
                    onChange={(e) => setFilters({ 
                      ...filters, 
                      maxPrice: e.target.value === 'all' ? Infinity : Number(e.target.value) 
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="all">Любая</option>
                    <option value={5000}>До 5,000 ₽</option>
                    <option value={20000}>До 20,000 ₽</option>
                    <option value={50000}>До 50,000 ₽</option>
                    <option value={100000}>До 100,000 ₽</option>
                  </select>
                </div>

                {/* Availability */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Доступность
                  </label>
                  <select
                    value={filters.availability}
                    onChange={(e) => setFilters({ ...filters, availability: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="all">Все</option>
                    <option value="online">Онлайн</option>
                    <option value="offline">Оффлайн</option>
                    <option value="busy">Занят</option>
                  </select>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.verified}
                      onChange={(e) => setFilters({ ...filters, verified: e.target.checked })}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700 flex items-center gap-1">
                      <Shield className="w-4 h-4 text-teal-600" />
                      Только проверенные
                    </span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.topRated}
                      onChange={(e) => setFilters({ ...filters, topRated: e.target.checked })}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700 flex items-center gap-1">
                      <Award className="w-4 h-4 text-amber-500" />
                      Топ специалисты
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1">
            {/* Controls */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {query ? `Результаты по запросу "${query}"` : 'Все специалисты'}
                </h1>
                <p className="text-sm text-gray-600">
                  Найдено специалистов: <span className="font-semibold">{specialists.length}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="relevance">По релевантности</option>
                  <option value="rating">По рейтингу</option>
                  <option value="reviews">По отзывам</option>
                  <option value="price_low">Цена: по возрастанию</option>
                  <option value="price_high">Цена: по убыванию</option>
                </select>

                {/* View Mode */}
                <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden px-4 py-2 bg-teal-600 text-white rounded-lg flex items-center gap-2"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Фильтры
                </button>
              </div>
            </div>

            {/* Specialists Grid/List */}
            {specialists.length > 0 ? (
              <div className={`
                ${viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 gap-6' 
                  : 'space-y-4'
                }
              `}>
                {specialists.map((specialist, index) => (
                  <motion.div
                    key={specialist.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/specialists/${specialist.id}`}>
                      <div className="bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-teal-200">
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className={`
                            flex-shrink-0 w-16 h-16 rounded-xl 
                            bg-gradient-to-br from-teal-400 to-teal-600
                            flex items-center justify-center text-white font-bold text-xl
                            ${specialist.availability === 'online' ? 'ring-4 ring-green-100' : ''}
                          `}>
                            {specialist.avatar}
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg text-gray-900 mb-1 flex items-center gap-2">
                                  {specialist.name}
                                  {specialist.verified && (
                                    <Shield className="w-4 h-4 text-teal-600" />
                                  )}
                                  {specialist.topRated && (
                                    <Award className="w-4 h-4 text-amber-500" />
                                  )}
                                </h3>
                                <p className="text-sm text-gray-600 mb-2">{specialist.title}</p>
                              </div>
                              
                              {specialist.availability === 'online' && (
                                <Badge className="bg-green-100 text-green-700 border-green-200">
                                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                                  Онлайн
                                </Badge>
                              )}
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-4 mb-3 text-sm">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold">{specialist.rating}</span>
                                <span className="text-gray-500">({specialist.reviewCount})</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-600">
                                <Award className="w-4 h-4" />
                                {specialist.completedJobs} заказов
                              </div>
                              <div className="flex items-center gap-1 text-gray-600">
                                <Clock className="w-4 h-4" />
                                {specialist.responseTime}
                              </div>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {specialist.description}
                            </p>

                            {/* Skills */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {specialist.skills.slice(0, 3).map((skill, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm">{specialist.location}</span>
                              </div>
                              <div className="text-right">
                                {specialist.hourlyRate && (
                                  <div className="text-lg font-bold text-teal-600">
                                    {specialist.hourlyRate.toLocaleString()} ₽/час
                                  </div>
                                )}
                                {specialist.fixedPrice && (
                                  <div className="text-lg font-bold text-teal-600">
                                    от {specialist.fixedPrice.toLocaleString()} ₽
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Ничего не найдено
                </h3>
                <p className="text-gray-600 mb-6">
                  Попробуйте изменить фильтры или поисковый запрос
                </p>
                <button
                  onClick={() => {
                    setFilters({
                      minRating: 0,
                      maxPrice: Infinity,
                      verified: false,
                      topRated: false,
                      availability: 'all',
                    });
                  }}
                  className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Сбросить фильтры
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Загрузка...</div>}>
      <SearchContent />
    </Suspense>
  );
}



