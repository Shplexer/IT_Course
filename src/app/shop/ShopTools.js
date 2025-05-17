"use client"
import '../../../public/general.css';
import '../globals.css';
import { useState, useEffect } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from "./shopNew.module.css"

export function SearchBar() {
	return (
		<div className={styles["search-bar-wrap"]}>
			<input className={styles["search-bar"]} type='text' placeholder='Поиск товаров' />
			<button className={styles["find-button"]}>Найти</button>
		</div>
	);
}
export function Filters({prices}) {
  
    const router = useRouter();
    // const searchParams = useSearchParams();
    const [priceRange, setPriceRange] = useState([Number(prices.price_min), Number(prices.price_max)]);

    const handleApplyFilters = () => {
      const params = new URLSearchParams();
      params.set('price_min', priceRange[0]);
      params.set('price_max', priceRange[1]);
      
      router.replace(`/shop?${params.toString()}`, { scroll: false });
      
    };
    return (
      <div className={styles["filters-wrap"]}>
        <h2>Фильтры:</h2>
        <div className={styles["filter-item"]}>
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
        <button className={styles["apply-filters"]} onClick={handleApplyFilters}>
          Применить фильтры
        </button>
      </div>
    );
  }