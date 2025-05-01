"use client"
import '../../../public/general.css';
import '../globals.css';
import { useState, useEffect } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useRouter, useSearchParams } from 'next/navigation';
export function SearchBar() {
	return (
		<div className='search-bar-wrap'>
			<input className='search-bar' type='text' placeholder='Поиск товаров' />
			<button className='find-button'>Найти</button>
		</div>
	);
}
export function Filters({prices}) {
  
    const router = useRouter();
    const searchParams = useSearchParams();
    // Initialize state from URL params if they exist
    const [priceRange, setPriceRange] = useState([Number(prices.price_min), Number(prices.price_max)]);
    
    // // Set initial values from URL when component mounts
    // useEffect(() => {
    //   const urlPriceMin = searchParams.get('price_min');
    //   const urlPriceMax = searchParams.get('price_max');
    //   const urlColor = searchParams.get('color');
      
    //   if (urlPriceMin && urlPriceMax) {
    //     setPriceRange([Number(urlPriceMin), Number(urlPriceMax)]);
    //   }
    //   if (urlColor) {
    //     setColor(urlColor);
    //   }
    // }, [searchParams]);
  
    const handleApplyFilters = () => {
      // Update URL with new filters
      const params = new URLSearchParams();
      params.set('price_min', priceRange[0]);
      params.set('price_max', priceRange[1]);
      
      router.replace(`/shop?${params.toString()}`, { scroll: false });
      
    };
    //console.log("loaded Filters");
    return (
      <div className='filters-wrap'>
        <h2>Фильтры:</h2>
        <div className='filter-item'>
          <input
            type='number'
            placeholder='0'
            value={priceRange[0]}
            onChange={(e) => {
              const newValue = Math.max(Number(e.target.value), prices.price_min);
              setPriceRange([newValue, priceRange[1]]);
            }}
            min="0"
          />
          -
          <input
            type='number'
            placeholder='1000'
            value={priceRange[1]}
            onChange={(e) => {
              const newValue = Math.min(Number(e.target.value), prices.price_max);
              setPriceRange([priceRange[0], newValue]);
            }}
            min={priceRange[0]}
          />
          <label htmlFor='price'>Цена: {priceRange[0]} ₽ - {priceRange[1]} ₽</label>
          <Slider
            range
            min={Number(prices.price_min)}
            max={Number(prices.price_max)}
            value={priceRange}
            onChange={(value) => setPriceRange(value)}
          />
        </div>
        <button className='apply-filters' onClick={handleApplyFilters}>
          Применить фильтры
        </button>
      </div>
    );
  }