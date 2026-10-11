import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/cart.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  // Загрузка корзины из localStorage при монтировании
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) {
        setCartItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Ошибка загрузки корзины:', e);
    }
  }, []);

  // Сохранение в localStorage при изменении
  const updateCart = (newItems) => {
    setCartItems(newItems);
    localStorage.setItem('cart', JSON.stringify(newItems));
  };

  const increaseQuantity = (id) => {
    const updated = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
    );
    updateCart(updated);
  };

  const decreaseQuantity = (id) => {
    const updated = cartItems
      .map((item) =>
        item.id === id ? { ...item, quantity: (item.quantity || 1) - 1 } : item
      )
      .filter((item) => item.quantity > 0);
    updateCart(updated);
  };

  const removeItem = (id) => {
    const updated = cartItems.filter((item) => item.id !== id);
    updateCart(updated);
  };

  const clearCart = () => {
    updateCart([]);
  };

  const handleCheckout = () => {
    setIsSuccess(true);
    localStorage.removeItem('cart');
    setCartItems([]);
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  if (isSuccess) {
    return (
      <div className="page-cart page-cart--empty">
        <div className="cart-success-box">
          <h2>🎉 Заказ успешно оформлен!</h2>
          <p>Спасибо за покупку в ЭлектроМаркете. Мы свяжемся с вами в ближайшее время.</p>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/items')}>
            Вернуться в каталог
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="page-cart page-cart--empty">
        <h2>Корзина пуста</h2>
        <p>Вы еще не добавили ни одного товара в корзину.</p>
        <Link to="/items" className="btn btn-primary">
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="page-cart">
      <h2>Корзина товаров</h2>
      <p>Проверьте выбранные товары перед оформлением заказа.</p>

      <div className="cart-content">
        <div className="cart-items-list">
          {cartItems.map((item) => {
            const itemImage = item.image || item.imageUrl || null;
            return (
              <div key={item.id} className="cart-item-row">
                {itemImage ? (
                  <img src={itemImage} alt="" className="cart-item-thumb" />
                ) : (
                  <div className="cart-item-thumb cart-item-thumb--placeholder">🖼️</div>
                )}
                <div className="cart-item-info">
                  <h4 className="cart-item-title">{item.title}</h4>
                  <p className="cart-item-price">{item.price} ₽</p>
                </div>

                <div className="cart-item-controls">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => decreaseQuantity(item.id)}
                  >
                    -
                  </button>
                  <span className="qty-value">{item.quantity || 1}</span>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => increaseQuantity(item.id)}
                  >
                    +
                  </button>
                </div>

                <div className="cart-item-total">
                  {item.price * (item.quantity || 1)} ₽
                </div>

                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeItem(item.id)}
                  title="Удалить товар"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>

        <div className="cart-summary">
          <h3>Итого</h3>
          <div className="summary-row">
            <span>Товары ({cartItems.reduce((acc, i) => acc + (i.quantity || 1), 0)} шт.)</span>
            <span>{totalPrice} ₽</span>
          </div>
          <div className="summary-total">
            <span>К оплате</span>
            <span>{totalPrice} ₽</span>
          </div>

          <div className="cart-summary-actions">
            <button type="button" className="btn btn-primary btn-checkout" onClick={handleCheckout}>
              Оформить заказ
            </button>
            <button type="button" className="btn btn-outline" onClick={clearCart}>
              Очистить корзину
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;