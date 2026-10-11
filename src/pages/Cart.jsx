import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import '../styles/Cart.css';

export default function Cart() {
  const { cart, removeFromCart, clearCart, totalPrice } = useCart();

  if (cart.length === 0) {
    return (
      <div className="page-cart container">
        <h2>Корзина</h2>
        <p>Ваша корзина пуста.</p>
        <Link to="/items" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Перейти в каталог</Link>
      </div>
    );
  }

  return (
    <div className="page-cart container">
      <h2>Корзина покупок</h2>
      <div className="cart-list" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {cart.map((item) => (
          <div key={item.id} className="cart-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img src={item.image || 'https://via.placeholder.com/60'} alt={item.title} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
              <div>
                <h4 style={{ margin: '0 0 4px' }}>{item.title}</h4>
                <p style={{ margin: 0, opacity: 0.8 }}>{item.price} ₽ × {item.quantity}</p>
              </div>
            </div>
            <button onClick={() => removeFromCart(item.id)} className="btn" style={{ background: '#ff5f56', color: '#fff', border: 'none' }}>Удалить</button>
          </div>
        ))}
      </div>
      <div className="cart-summary" style={{ marginTop: '24px', padding: '20px', border: '1px solid var(--border)', borderRadius: '12px' }}>
        <h3>Итого к оплате: {totalPrice} ₽</h3>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button onClick={clearCart} className="btn">Очистить</button>
          <button onClick={() => { alert('Заказ оформлен!'); clearCart(); }} className="btn btn-primary">Оформить заказ</button>
        </div>
      </div>
    </div>
  );
}