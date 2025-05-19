// src/app/shop/ShopTools.js
"use client"
import '../../../public/general.css';
import '../globals.css';
import { useState, useEffect } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from "./shopNew.module.css"

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);
    
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim());
    } else {
      params.delete('search');
    }
    
    router.replace(`/shop?${params.toString()}`, { scroll: false });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={styles["search-bar-wrap"]}>
      <input 
        className={styles["search-bar"]} 
        type='text' 
        placeholder='Поиск товаров' 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button className={styles["find-button"]} onClick={handleSearch}>
        Найти
      </button>
    </div>
  );
}

export function Filters({ prices, attributes, types }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [priceRange, setPriceRange] = useState([Number(prices.price_min), Number(prices.price_max)]);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [selectedType, setSelectedType] = useState(null);
    console.log(attributes);
  useEffect(() => {
    // Initialize selected attributes from URL params
    const params = new URLSearchParams(searchParams);
    const initialAttributes = {};
    
    // Initialize type filter if present
    const typeParam = params.get('type');
    if (typeParam) {
      setSelectedType(typeParam);
    }
    
    attributes.forEach(attr => {
      const paramValues = params.getAll(`attr_${attr.attribute_id}`);
      if (paramValues.length > 0) {
        initialAttributes[attr.attribute_id] = paramValues;
      }
    });
    
    setSelectedAttributes(initialAttributes);
  }, [searchParams, attributes]);

  const handleAttributeChange = (attributeId, value, isChecked) => {
    setSelectedAttributes(prev => {
      const newAttributes = { ...prev };
      
      if (isChecked) {
        newAttributes[attributeId] = [...(newAttributes[attributeId] || []), value];
      } else {
        newAttributes[attributeId] = (newAttributes[attributeId] || []).filter(v => v !== value);
        if (newAttributes[attributeId].length === 0) {
          delete newAttributes[attributeId];
        }
      }
      
      return newAttributes;
    });
  };

  const handleTypeChange = (typeId) => {
    setSelectedType(typeId === selectedType ? null : typeId);
    // Clear attributes when changing type to avoid invalid combinations
    setSelectedAttributes({});
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    
    // Price range
    params.set('price_min', priceRange[0]);
    params.set('price_max', priceRange[1]);
    
    // Type filter
    if (selectedType) {
      params.set('type', selectedType);
    }
    
    // Attributes
    Object.entries(selectedAttributes).forEach(([attrId, values]) => {
      values.forEach(value => {
        params.append(`attr_${attrId}`, value);
      });
    });
    
    router.replace(`/shop?${params.toString()}`, { scroll: false });
  };
  const handleCancelFilters = () => {
    setSelectedType(null);
    router.replace(`/shop`, { scroll: false });
  };
  // Get all unique attributes for the selected type (or all if no type selected)
  const getFilteredAttributes = () => {
    if (!selectedType) {
      // If no type selected, show all attributes
      return [];
    }
    console.log("+++++++++++++++");
    console.log(attributes);
    console.log("+++++++++++++++");
    // Filter attributes to only those that belong to the selected type
    return attributes.filter(attr => attr.product_type_id == selectedType);
  };

  // Group filtered attributes by attribute_id and get unique values
  const groupedAttributes = getFilteredAttributes().reduce((acc, attr) => {
    if (!acc[attr.attribute_id]) {
      acc[attr.attribute_id] = {
        name: attr.attribute_name,
        values: new Set(),
        product_type_id: attr.product_type_id
      };
    }
    acc[attr.attribute_id].values.add(attr.value);
    return acc;
  }, {});

  return (
    <div className={styles["filters-wrap"]}>
      <h2>Фильтры:</h2>
      
      {/* Type Filter */}
      <div className={styles["filter-item"]}>
        <label>Тип товара</label>
        <div className={styles["filter-options"]}>
          {types.map(type => (
            <div key={type.id}
              className={styles['filter-label']}
            >
              <input
                type="radio"  // Changed to radio for single selection
                id={`type_${type.id}`}
                name="productType"
                checked={selectedType == type.id}
                onChange={() => handleTypeChange(type.id)}
              />
              <label htmlFor={`type_${type.id}`}>{type.name}</label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Price Filter */}
      <div className={styles["filter-item"]}>
        <label>Цена:</label>
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
        <div className={styles["slider-container"]}>

        <label htmlFor='price'>{priceRange[0]} ₽ - {priceRange[1]} ₽</label>
        <Slider
          range
          min={Number(prices.price_min)}
          max={Number(prices.price_max)}
          value={priceRange}
          step={0.01}
          onChange={(value) => setPriceRange(value)}
          />
          </div>
      </div>
      
      {/* Attribute Filters - Only show if we have attributes to display */}
      {Object.keys(groupedAttributes).length > 0 && (
        <div className={styles["filter-item"]}>
          <label>Характеристики</label>
          {Object.entries(groupedAttributes).map(([attrId, attrData]) => (
            <div key={attrId} className={styles["filter-options"]}>
              <h4>{attrData.name}</h4>
              {Array.from(attrData.values).map(value => (
                <div key={value}>
                  <input
                    type="checkbox"
                    id={`attr_${attrId}_${value}`}
                    checked={selectedAttributes[attrId]?.includes(value) || false}
                    onChange={(e) => handleAttributeChange(attrId, value, e.target.checked)}
                  />
                  <label htmlFor={`attr_${attrId}_${value}`}>{value}</label>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      
      <button className={styles["apply-filters"]} onClick={handleApplyFilters}>
        Применить фильтры
      </button>
        <button className={styles["apply-filters"]} onClick={handleCancelFilters}>
        Сбросить фильтры
      </button>
    </div>
  );
}