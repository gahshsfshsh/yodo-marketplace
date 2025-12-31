'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Home, Ruler, Clock, TrendingUp, Check } from 'lucide-react';

interface ServiceOption {
  id: string;
  name: string;
  pricePerUnit: number;
  unit: string;
}

const serviceTypes = [
  { value: 'renovation', label: 'Ремонт квартиры', icon: '🏠' },
  { value: 'construction', label: 'Строительство дома', icon: '🏗️' },
  { value: 'design', label: 'Дизайн интерьера', icon: '🎨' },
  { value: 'plumbing', label: 'Сантехника', icon: '🚰' },
  { value: 'electric', label: 'Электромонтаж', icon: '⚡' },
];

const renovationOptions: ServiceOption[] = [
  { id: 'cosmetic', name: 'Косметический ремонт', pricePerUnit: 3500, unit: 'м²' },
  { id: 'major', name: 'Капитальный ремонт', pricePerUnit: 8500, unit: 'м²' },
  { id: 'designer', name: 'Дизайнерский ремонт', pricePerUnit: 15000, unit: 'м²' },
];

const constructionOptions: ServiceOption[] = [
  { id: 'frame', name: 'Каркасный дом', pricePerUnit: 25000, unit: 'м²' },
  { id: 'brick', name: 'Кирпичный дом', pricePerUnit: 35000, unit: 'м²' },
  { id: 'wood', name: 'Деревянный дом', pricePerUnit: 28000, unit: 'м²' },
];

export default function ServiceCalculator() {
  const [serviceType, setServiceType] = useState('renovation');
  const [area, setArea] = useState(50);
  const [selectedOption, setSelectedOption] = useState<ServiceOption | null>(renovationOptions[0]);
  const [urgency, setUrgency] = useState(1);

  const options = serviceType === 'renovation' ? renovationOptions : constructionOptions;
  
  const basePrice = selectedOption ? selectedOption.pricePerUnit * area : 0;
  const urgencyMultiplier = urgency === 1 ? 1 : urgency === 2 ? 1.2 : 1.5;
  const totalPrice = basePrice * urgencyMultiplier;

  const handleServiceTypeChange = (type: string) => {
    setServiceType(type);
    setSelectedOption(type === 'renovation' ? renovationOptions[0] : constructionOptions[0]);
  };

  return (
    <div id="calculator" className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 shadow-xl border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
          <Calculator className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Калькулятор стоимости</h2>
          <p className="text-sm text-gray-500">Рассчитайте примерную стоимость услуг</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Inputs */}
        <div className="space-y-6">
          {/* Service Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Тип услуги
            </label>
            <div className="grid grid-cols-2 gap-3">
              {serviceTypes.slice(0, 4).map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleServiceTypeChange(type.value)}
                  className={`
                    p-4 rounded-xl border-2 transition-all duration-200 text-left
                    ${serviceType === type.value
                      ? 'border-primary-500 bg-primary-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                    }
                  `}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className={`text-sm font-medium ${
                    serviceType === type.value ? 'text-primary-700' : 'text-gray-700'
                  }`}>
                    {type.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Service Option */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Вид работ
            </label>
            <div className="space-y-2">
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedOption(option)}
                  className={`
                    w-full p-4 rounded-xl border-2 transition-all duration-200 text-left flex items-center justify-between
                    ${selectedOption?.id === option.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                    }
                  `}
                >
                  <div>
                    <div className={`font-medium mb-1 ${
                      selectedOption?.id === option.id ? 'text-primary-700' : 'text-gray-900'
                    }`}>
                      {option.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      от {option.pricePerUnit.toLocaleString()} ₽/{option.unit}
                    </div>
                  </div>
                  {selectedOption?.id === option.id && (
                    <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Area */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Площадь: <span className="text-primary-600">{area} м²</span>
            </label>
            <div className="space-y-3">
              <input
                type="range"
                min="10"
                max="500"
                value={area}
                onChange={(e) => setArea(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>10 м²</span>
                <span>250 м²</span>
                <span>500 м²</span>
              </div>
            </div>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Срочность
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 1, label: 'Обычная', desc: 'Без спешки' },
                { value: 2, label: 'Средняя', desc: '+20%' },
                { value: 3, label: 'Срочно', desc: '+50%' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setUrgency(option.value)}
                  className={`
                    p-3 rounded-xl border-2 transition-all duration-200
                    ${urgency === option.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                    }
                  `}
                >
                  <div className={`text-sm font-medium ${
                    urgency === option.value ? 'text-primary-700' : 'text-gray-700'
                  }`}>
                    {option.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Result */}
        <div className="flex flex-col">
          <motion.div
            key={totalPrice}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-8 text-white shadow-2xl flex-1 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium opacity-90">Расчет стоимости</span>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <Ruler className="w-5 h-5 opacity-80" />
                  <div className="flex-1">
                    <div className="text-sm opacity-80">Площадь</div>
                    <div className="font-semibold">{area} м²</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5 opacity-80" />
                  <div className="flex-1">
                    <div className="text-sm opacity-80">Тип работ</div>
                    <div className="font-semibold">{selectedOption?.name}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 opacity-80" />
                  <div className="flex-1">
                    <div className="text-sm opacity-80">Срочность</div>
                    <div className="font-semibold">
                      {urgency === 1 ? 'Обычная' : urgency === 2 ? 'Средняя (+20%)' : 'Срочно (+50%)'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="border-t border-white/20 pt-6 mb-6">
                <div className="text-sm opacity-80 mb-2">Примерная стоимость:</div>
                <div className="text-5xl font-bold mb-1">
                  {totalPrice.toLocaleString()} ₽
                </div>
                <div className="text-sm opacity-70">
                  ~ {Math.ceil(area / 10)} - {Math.ceil(area / 5)} дней работы
                </div>
              </div>

              <button className="w-full py-4 bg-white text-primary-600 rounded-xl font-semibold hover:shadow-xl transition-all duration-200 hover:scale-105">
                Найти специалиста
              </button>
              
              <p className="text-xs text-center mt-4 opacity-70">
                * Точная стоимость рассчитывается индивидуально
              </p>
            </div>
          </motion.div>

          {/* Tips */}
          <div className="mt-6 p-5 bg-blue-50 rounded-xl border border-blue-100">
            <h4 className="font-semibold text-blue-900 mb-2 text-sm">💡 Совет</h4>
            <p className="text-xs text-blue-700 leading-relaxed">
              Для точного расчета рекомендуем получить смету от нескольких специалистов. 
              Средняя разница в ценах может составлять до 30%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

