"use client"

import Header from './header/page.js';
import '../../public/mainPage.css';
import '../../public/general.css';

import React, { useState } from 'react';
const sampleText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
export default function MainPage() {


	return (
		<div>
			<PromoTab />
			<Intro />
		</div>
	)
}

function PromoTab() {
	
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);
	const [direction, setDirection] = useState('next');
	const [oppositeDirection, setOppositeDirection] = useState('prev');
	const promos = [
		{
			productImage: './products/prod-1.png',
			backgroundImage: './backgrounds/bg1.jpg',
			text: 'ТОВАР 1',
			subtext: sampleText,
			productLink: 'wikipedia.org'
		},
		{
			productImage: './products/prod-2.png',
			backgroundImage: './backgrounds/bg2.jpg',
			text: 'ТОВАР 2',
			subtext: sampleText,
			productLink: 'wikipedia.org'
		},
		{
			productImage: './products/prod-3.png',
			backgroundImage: './backgrounds/bg3.jpg',
			text: 'ТОВАР 3',
			subtext: sampleText,
			productLink: 'wikipedia.org'
		}


		// Add more image paths as needed
	];

	const nextImage = () => {
		if (isAnimating) return;
		setDirection('next');
		setOppositeDirection ('prev');
		setIsAnimating(true);
		setTimeout(() => {
		  setCurrentImageIndex((prevIndex) => (prevIndex + 1) % promos.length);
		  setIsAnimating(false);
		}, 500); // This should match the transition duration in CSS
	  };
	
	  const prevImage = () => {
		if (isAnimating) return;
		// setDirection('prev');
		// setOppositeDirection ('next');
		setDirection('next');
		setOppositeDirection ('prev');
		setIsAnimating(true);
		setTimeout(() => {
		  setCurrentImageIndex((prevIndex) => (prevIndex - 1 + promos.length) % promos.length);
		  setIsAnimating(false);
		}, 500); // This should match the transition duration in CSS
	  };

	  return (
		<div className="promo-banner">
		  <div className={`banner-content `}>
			<div className="banner-info-wrap">
			  <div className={`banner-info ${isAnimating ? `slide-${direction}` : ''} `}>
				<h1>{promos[currentImageIndex].text}</h1>
				<p>{promos[currentImageIndex].subtext}</p>
				<button className='buy-button'>Подробнее</button>
			  </div>
			  <img
				src={promos[currentImageIndex].productImage}
				alt={`Product${currentImageIndex}`}
				className={`banner-image ${isAnimating ? `slide-${oppositeDirection}` : ''}`}
			  />
			</div>
		  </div>
		  <button className="banner-button left" onClick={prevImage}>&#10094;</button>
		  <button className="banner-button right" onClick={nextImage}>&#10095;</button>
		  <img
			src={promos[currentImageIndex].backgroundImage}
			alt={`Promo${currentImageIndex}`}
			className={`banner-image-bg ${isAnimating ? 'fade' : ''}`}
		  />
		</div>
	  );
}
function Intro() {
	return (
		<div className='intro-wrap'>
			<div className='intro-text'>
				<h1 style={{ fontSize: '50px' }}>Продажа деталей в Санкт-Петербурге</h1>
				<p>{sampleText}</p>
				<GridLayout />
			</div>
			{/* <FillableForm /> */}
		</div>
	);
}
function GridLayout() {
	const items = [
		{
			id: 1,
			text: 'Лучшие детали',
			subtext: sampleText,
			icon: './icons/best-parts.png',
		},
		{
			id: 2,
            text: 'Дешевые цены',
			subtext: sampleText,
			icon: './icons/cheap-prices.png',
		},
		{
			id: 3,
            text: 'Быстрая доставка',
			subtext: sampleText,
			icon: './icons/fast-delivery.png',
		},
		{
			id: 4,
            text: 'Большой опыт работы',
			subtext: sampleText,
			icon: './icons/experienced.png',
		}

	];
	const listItems = items.map(item =>
		<div key={item.id} >

			<div className='intro-grid-item'>
				<img
					src={item.icon}
					className='icon-with-text'
					>
				</img>
				<p className='text-with-icon' >{item.text}</p>
			</div>
			<p style={{fontSize: '16px'}}>{item.subtext}</p>
		</div>
	);
	return (
		<div className='intro-grid-info'>
			{listItems}
		</div>
	);
}
function FillableForm() {

	return (
		<form className='fillable-form styled-input '>
			<p>Оставить заявку</p>
			<label htmlFor="input" className="text">Ваше имя:</label>
			<input type='text' id='name' name="name" className="input" placeholder='' />
			<label htmlFor="input" className="text">Ваш телефон:</label>
			<input type='text' id='phone' name='phone' className="input" placeholder='' />
		</form>
	);
}