'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TrendingUp, MapPin, Users, Star, ChevronRight } from 'lucide-react';

interface SearchCategory {
  title: string;
  items: Array<{
    name: string;
    count?: number;
    href: string;
  }>;
}

const searchCategories: SearchCategory[] = [
  {
    title: 'По специальности',
    items: [
      { name: 'Электрики', count: 1250, href: '/search?category=electric' },
      { name: 'Сантехники', count: 980, href: '/search?category=plumbing' },
      { name: 'Строители', count: 2100, href: '/search?category=construction' },
      { name: 'Дизайнеры интерьера', count: 680, href: '/search?category=design' },
      { name: 'Мастера по ремонту', count: 1540, href: '/search?category=repair' },
      { name: 'Архитекторы', count: 320, href: '/search?category=architecture' },
    ],
  },
  {
    title: 'По районам Москвы',
    items: [
      { name: 'ЦАО', count: 890, href: '/search?district=cao' },
      { name: 'СВАО', count: 670, href: '/search?district=svao' },
      { name: 'ЮАО', count: 540, href: '/search?district=uao' },
      { name: 'ВАО', count: 480, href: '/search?district=vao' },
      { name: 'ЗАО', count: 620, href: '/search?district=zao' },
      { name: 'Все районы', href: '/search?district=all' },
    ],
  },
  {
    title: 'По рейтингу',
    items: [
      { name: 'Топ-специалисты (4.8+)', href: '/search?rating=4.8' },
      { name: 'Проверенные (4.5+)', href: '/search?rating=4.5' },
      { name: 'С отзывами (10+)', href: '/search?reviews=10' },
      { name: 'Новички', href: '/search?new=true' },
    ],
  },
  {
    title: 'По ценам',
    items: [
      { name: 'Эконом (до 1000₽/час)', href: '/search?price=economy' },
      { name: 'Средний (1000-2000₽/час)', href: '/search?price=medium' },
      { name: 'Премиум (от 2000₽/час)', href: '/search?price=premium' },
      { name: 'Договорная', href: '/search?price=negotiable' },
    ],
  },
  {
    title: 'Популярные услуги',
    items: [
      { name: 'Ремонт под ключ', href: '/search?service=full-renovation' },
      { name: 'Электропроводка', href: '/search?service=wiring' },
      { name: 'Сантехнические работы', href: '/search?service=plumbing' },
      { name: 'Отделочные работы', href: '/search?service=finishing' },
      { name: 'Дизайн-проект', href: '/search?service=design-project' },
      { name: 'Все услуги', href: '/services' },
    ],
  },
  {
    title: 'Срочные работы',
    items: [
      { name: 'Аварийная сантехника', href: '/search?urgent=plumbing' },
      { name: 'Электрик на выезд', href: '/search?urgent=electric' },
      { name: 'Срочный ремонт', href: '/search?urgent=repair' },
      { name: 'Экспресс-услуги', href: '/search?urgent=all' },
    ],
  },
];

const trendingSearches = [
  'Ремонт квартир под ключ',
  'Электрик Москва недорого',
  'Сантехник срочно на дом',
  'Дизайнер интерьера цены',
  'Строительство дома под ключ',
  'Мастер по мебели',
  'Установка кондиционера',
  'Натяжные потолки',
];

export default function FrequentlySearched() {
  const [activeTab, setActiveTab] = useState<'find' | 'offer'>('find');

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full mb-4">
            <TrendingUp className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-semibold text-primary-700">Популярное</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Часто ищут
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Быстрый доступ к популярным категориям и специалистам
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setActiveTab('find')}
              className={`
                px-6 py-3 rounded-lg font-medium transition-all duration-200
                ${activeTab === 'find'
                  ? 'bg-white text-primary-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              Найти специалиста
            </button>
            <button
              onClick={() => setActiveTab('offer')}
              className={`
                px-6 py-3 rounded-lg font-medium transition-all duration-200
                ${activeTab === 'offer'
                  ? 'bg-white text-primary-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              Разместить заказ
            </button>
          </div>
        </div>

        {/* Trending Bar */}
        <div className="mb-10 p-6 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl text-white shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg">🔥 В тренде сейчас</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingSearches.map((search, idx) => (
              <Link
                key={idx}
                href={`/search?q=${encodeURIComponent(search)}`}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium backdrop-blur-sm transition-all hover:scale-105 border border-white/20"
              >
                {search}
              </Link>
            ))}
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchCategories.map((category, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:border-primary-200"
            >
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 group-hover:text-primary-600 transition-colors">
                {category.title === 'По специальности' && <Users className="w-5 h-5" />}
                {category.title === 'По районам Москвы' && <MapPin className="w-5 h-5" />}
                {category.title === 'По рейтингу' && <Star className="w-5 h-5" />}
                {category.title}
              </h3>
              <ul className="space-y-2.5">
                {category.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <Link
                      href={item.href}
                      className="flex items-center justify-between text-sm text-gray-600 hover:text-primary-600 hover:translate-x-1 transition-all duration-200 group/item"
                    >
                      <span className="group-hover/item:font-medium">{item.name}</span>
                      <div className="flex items-center gap-2">
                        {item.count && (
                          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                            {item.count}
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            Смотреть всех специалистов
            <ChevronRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

