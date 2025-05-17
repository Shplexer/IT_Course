"use client"
import './header.css';
import '../../../public/general.css';
import LoginOverlay from '../login/page';
import React, { useEffect, useState } from 'react';

import Link from 'next/link'
export default function Header({ numToDisplay }) {
	return (
		<header className='header'>
			<div className='header-info'>

				<Logo />
				<Addresses />
				<Socials />
				<Contacts numToDisplay={numToDisplay} />
			</div>
			<div className='header-menu'>
				<Menu />
			</div>

		</header>
	);
}

function Logo() {
	return (
		<div className='logo'>
			<a href='/'>
				<img
					className='logoImage'
					src='/icons/logo.jpg'
				/>
			</a>
		</div>
	);
}

function Contacts({ numToDisplay }) {
	const [cartCount, setCartCount] = useState(numToDisplay);
	// Sync with server when prop changes
	useEffect(() => {
		setCartCount(numToDisplay);
	}, [numToDisplay]);

	return (
		<div className='contacts'>
			<div className='contact-actions'>
				<div className="contact-item">
					<img
						src='/icons/envelope.png'
						className='contact-icon icon-with-text'
					/>
					<a className='text-with-icon' href='mailto:info@ventilation.com'>info@ventilation.com</a>
				</div>
				<div className="contact-item">
					<img
						src='/icons/phone-call.png'
						className='contact-icon icon-with-text'
					/>
					<a className='text-with-icon' href='tel:+78005553535'>8 (800) 555-35-35</a>
				</div>
				<div className='button-container'>
					<div className='login-icon'>
						<LoginOverlay />
					</div>
					<div className="cart-icon">
						<Link href={'/cart'}>
							<button className='cart'>Корзина</button>
						</Link>
						<span className="cart-count">{cartCount}</span>
					</div>
				</div>
			</div>
		</div>
	);

}
function Socials() {

}
function Addresses() {
	return (
		<div className='addresses'>
			<div className='addresses-item'>
				<img
					src='/icons/marker.png'
					className='addresses-icon icon-with-text'
				/>
				<a className='text-with-icon' href='https://maps.google.com/?q=ventilation+company'>г. Санкт-Петербург, ул. Пушкина, д. Колотушкина</a>
			</div>
		</div>
	);
}
function Menu() {
	const [hoveredItem, setHoveredItem] = useState(null);
	const menuItems = [
		{ name: 'Магазин', isDroppable: false, link: '/shop' },
		{ name: 'О нас', options: ['Наши проекты', 'Сертификация', 'Условия доставки'], isDroppable: true, link: '/shop' },
		{ name: 'Контакты', isDroppable: false, link: '/shop' },
	];
	return (
		<nav className="menu">
			<ul>
				{menuItems.map((item, index) => (
					<li key={index}
						onMouseEnter={() => setHoveredItem(index)}
						onMouseLeave={() => setHoveredItem(null)}
					>
						<Link
							className='text-with-icon'
							href={`${item.link}`}
						>
							{item.name}
							{item.isDroppable && (

								<img
									src='/icons/angle-small-down.png'
									className='icon-with-text'
									style={{
										height: '1em',
										width: 'auto',
										maxWidth: '1em',
										objectFit: 'contain',
										marginRight: '0',
										marginLeft: '0.5em',


										verticalAlign: 'middle',

									}}
								/>
							)}
						</Link>
						{item.isDroppable && hoveredItem === index && (
							<ul className="dropdown">
								{item.options.map((option, optionIndex) => (
									<li key={optionIndex}><a>{option}</a></li>
								))}
							</ul>
						)}
					</li>
				))}
			</ul>
		</nav>
	);

}
