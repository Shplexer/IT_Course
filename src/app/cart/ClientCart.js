'use server'
export default function Cart(){

    return (
        <div className="cart">
            <h2>Корзина</h2>
            <div className="cart-items">
                {/* Cart items will be rendered here */}
            </div>
            <div className="cart-summary">
                {/* Cart summary will be rendered here */}
            </div>
        </div>
    );
}