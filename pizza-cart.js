document.addEventListener('DOMContentLoaded', function () {

    function injectMiniCartStyles() {
        const styleId = 'mini-cart-item-styles';
        if (document.getElementById(styleId)) {
            return;
        }
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            .mini-cart-item-name { text-decoration: none; font-weight: bold; color: black; }
            .mini-cart-item-name:hover { color: #fecd1a; }
            .mini-cart-remove-btn { display: inline-block; width: 24px; height: 24px; line-height: 24px; text-align: center; border-radius: 50%; cursor: pointer; font-weight: bold; transition: background-color 0.2s, color 0.2s; }
            .mini-cart-remove-btn:hover { background-color: red; color: white; }
        `;
        document.head.appendChild(style);
    }
    injectMiniCartStyles();

    const cartContainer = document.getElementById('cart-container');
    const cartEmptyMessage = document.getElementById('cart-empty-message');
    const cartCountElement = document.querySelector('.header-cart-total');
    const miniCartContainer = document.querySelector('.kadence-mini-cart-refresh');

    function getCart() {
        return JSON.parse(localStorage.getItem('pizzaCart')) || [];
    }

    function saveCart(cart) {
        localStorage.setItem('pizzaCart', JSON.stringify(cart));
        updateCartCount();
        renderMiniCart();
    }

    function updateCartCount() {
        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCountElement) cartCountElement.textContent = totalItems;
    }

    function formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    }

    function getRootPath() {
        const path = window.location.pathname.toLowerCase().replace(/\\/g, '/');
        if (path.includes('/product/') || path.includes('/menu/') || path.includes('/trackorder/') || path.includes('/account/')) {
            return '../';
        }
        return '';
    }

    function renderMiniCart() {
        if (!miniCartContainer) return;
        const cart = getCart();
        const root = getRootPath();

        if (cart.length === 0) {
            miniCartContainer.innerHTML = `<p class="woocommerce-mini-cart__empty-message">Không có sản phẩm trong giỏ hàng.</p>`;
            return;
        }

        let subtotal = 0;
        const miniCartItemsHTML = cart.map((item, index) => {
            subtotal += item.price * item.quantity;
            return `
                <div class="woocommerce-mini-cart-item" style="display: flex; align-items: center; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
                    <img src="${item.image.startsWith('http') ? item.image : root + item.image}" width="60" style="margin-right: 10px;">
                    <div style="flex-grow: 1;">
                        <div class="mini-cart-item-name">${item.name}</div>
                        <div style="font-size: 0.9em; color: #666;">${item.quantity} &times; ${formatPrice(item.price)}</div>
                    </div>
                    <span class="remove-mini-cart-item mini-cart-remove-btn" data-index="${index}">&times;</span>
                </div>`;
        }).join('');

        miniCartContainer.innerHTML = `
            <div class="woocommerce-mini-cart">${miniCartItemsHTML}</div>
            <p class="total" style="font-size: 1.2em; padding-top: 15px; border-top: 2px solid #333;">
                <strong>Tổng cộng:</strong> <span style="float: right;">${formatPrice(subtotal)}</span>
            </p>
            <p class="buttons">
                <a href="${root}cart.html" class="button wc-forward">Xem giỏ hàng</a>
                <a href="#" id="mini-checkout-btn" class="button checkout wc-forward">Thanh toán</a>
            </p>`;

        miniCartContainer.querySelectorAll('.remove-mini-cart-item').forEach(btn => {
            btn.onclick = (e) => {
                const idx = e.target.dataset.index;
                let c = getCart(); c.splice(idx, 1); saveCart(c);
                if (cartContainer) renderCart();
            };
        });
        
        const mcBtn = document.getElementById('mini-checkout-btn');
        if (mcBtn) mcBtn.onclick = () => window.location.href = root + 'checkout.html';
    }

    // --- Order Detail Modal Logic ---
    window.viewOrderDetails = function(orderId) {
        const orders = JSON.parse(localStorage.getItem('pizzaOrders')) || [];
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        const modal = document.getElementById('order-detail-modal');
        const content = document.getElementById('order-detail-content');
        if (!modal || !content) return;

        content.innerHTML = `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-x-4 gap-y-3">
                    <div class="text-text-secondary text-sm font-medium">Khách hàng:</div>
                    <div class="font-bold text-text-main dark:text-white">${order.customerName}</div>
                    <div class="text-text-secondary text-sm font-medium">Điện thoại:</div>
                    <div class="font-bold text-text-main dark:text-white">${order.phone}</div>
                    <div class="text-text-secondary text-sm font-medium">Vị trí:</div>
                    <div class="font-bold text-text-main dark:text-white">${order.tableInfo ? 'Bàn ' + order.tableInfo : order.district}</div>
                    <div class="text-text-secondary text-sm font-medium">Hình thức:</div>
                    <div class="font-bold text-text-main dark:text-white">${order.tableInfo ? 'Tại quán' : 'Giao tận nơi'}</div>
                </div>
                <div class="border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
                    <div class="text-sm font-bold text-text-main dark:text-white mb-3 uppercase tracking-wider">Chi tiết thực đơn</div>
                    <div class="space-y-3">
                        ${order.items.map(item => `
                            <div class="flex justify-between items-start text-sm">
                                <div class="flex gap-3">
                                    <span class="flex items-center justify-center size-6 rounded bg-primary/10 text-primary font-bold text-xs">${item.quantity}</span>
                                    <div>
                                        <div class="font-medium text-text-main dark:text-white">${item.name}</div>
                                        <div class="text-[11px] text-text-secondary">${item.options || ''}</div>
                                    </div>
                                </div>
                                <span class="font-bold text-text-main dark:text-white">${formatPrice(item.price * item.quantity)}</span>
                            </div>`).join('')}
                    </div>
                </div>
                <div class="border-t border-gray-100 dark:border-gray-700 pt-4 mt-4 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 -mx-6 -mb-6 p-6 rounded-b-xl">
                    <div class="text-base font-bold text-text-main dark:text-white">Tổng cộng</div>
                    <div class="text-2xl font-black text-primary">${formatPrice(order.total)}</div>
                </div>
            </div>`;
        
        modal.style.display = 'flex';
        const wrapper = document.getElementById('wrapper');
        if (wrapper) wrapper.style.filter = 'blur(4px)';
    };

    const closeModal = () => {
        const modal = document.getElementById('order-detail-modal');
        if (modal) modal.style.display = 'none';
        const wrapper = document.getElementById('wrapper');
        if (wrapper) wrapper.style.filter = '';
    };
    const closeBtn = document.getElementById('close-detail-modal');
    if (closeBtn) closeBtn.onclick = closeModal;
    const modalEl = document.getElementById('order-detail-modal');
    if (modalEl) modalEl.onclick = (e) => { if (e.target === modalEl) closeModal(); };

    function initOrderTracking() {
        const orderListContainer = document.getElementById('order-tracking-list');
        if (!orderListContainer) return;

        function updateTracking() {
            const orders = JSON.parse(localStorage.getItem('pizzaOrders')) || [];
            const now = new Date().getTime();

            if (orders.length === 0) {
                orderListContainer.innerHTML = '<div class="col-span-full text-center py-20 bg-surface-light dark:bg-surface-dark rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800"><span class="material-symbols-outlined text-4xl text-gray-300 mb-2">inbox</span><p class="text-text-secondary text-sm">Chưa có đơn hàng nào.</p></div>';
                return;
            }

            orderListContainer.innerHTML = orders.map((order) => {
                const elapsed = Math.floor((now - order.timestamp) / 1000);
                const cookingTime = 120;
                const deliveryTime = 240;
                
                let badge = '', action = '', progress = 0;

                if (elapsed < cookingTime) {
                    progress = (elapsed / cookingTime) * 100;
                    badge = `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"><span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>Đang chế biến</span>`;
                    action = `<div class="flex justify-between items-end mb-2"><div class="flex items-center gap-1.5 text-text-secondary"><span class="material-symbols-outlined text-[18px]">timer</span><span class="text-sm font-medium">${Math.floor((cookingTime - elapsed)/60)}:${((cookingTime - elapsed)%60).toString().padStart(2,'0')}</span></div><span class="text-xs font-bold text-primary">${Math.floor(progress)}%</span></div><div class="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden"><div class="bg-primary h-2 rounded-full" style="width: ${progress}%"></div></div>`;
                } else {
                    if (order.tableInfo) {
                        badge = `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><span class="material-symbols-outlined text-[14px]">check_circle</span>Sẵn sàng</span>`;
                        action = `<button onclick="alert('Gọi món thành công!')" class="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-bold shadow-md"> Gọi phục vụ</button>`;
                    } else {
                        if (elapsed < deliveryTime) {
                            progress = ((elapsed - cookingTime) / (deliveryTime - cookingTime)) * 100;
                            badge = `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"><span class="material-symbols-outlined text-[14px]">two_wheeler</span>Đang giao</span>`;
                            action = `<div class="flex items-center justify-center gap-2 bg-orange-500 text-white py-2 rounded-lg text-sm font-bold mb-3"><span class="material-symbols-outlined">delivery_dining</span>Shipper đang đến</div><div class="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden"><div class="bg-orange-500 h-2 rounded-full" style="width: ${progress}%"></div></div>`;
                        } else {
                            badge = `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><span class="material-symbols-outlined text-[14px]">task_alt</span>Hoàn thành</span>`;
                            action = `<div class="flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg text-sm font-bold shadow-md"><span class="material-symbols-outlined">verified</span>Giao hàng thành công</div>`;
                        }
                    }
                }

                return `
                    <div class="bg-surface-light dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col hover:border-primary/40 transition-all overflow-hidden">
                        <div class="p-5 flex-1 flex flex-col">
                            <div class="flex justify-between items-start mb-4">
                                <div>
                                    <h3 class="text-lg font-bold text-text-main dark:text-white flex items-center gap-2">
                                        ${order.tableInfo ? 'Bàn ' + order.tableInfo : order.id}
                                        <button onclick="window.viewOrderDetails('${order.id}')" class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-text-secondary hover:text-primary"><span class="material-symbols-outlined text-[20px]">visibility</span></button>
                                    </h3>
                                    <span class="text-xs text-text-secondary font-medium">${order.tableInfo ? 'Phục vụ tại bàn' : 'Giao: ' + order.district}</span>
                                </div>
                                ${badge}
                            </div>
                            <div class="space-y-3 mb-6 flex-1">
                                ${order.items.map(item => `
                                    <div class="flex justify-between items-center text-sm border-b border-gray-50 dark:border-gray-800/50 pb-2">
                                        <span class="text-text-main dark:text-white flex items-center gap-2">
                                            <span class="flex items-center justify-center size-5 rounded bg-gray-100 dark:bg-gray-800 text-[10px] font-bold">${item.quantity}</span>
                                            <span class="truncate max-w-[120px]">${item.name}</span>
                                        </span>
                                        <span class="text-xs font-bold">${formatPrice(item.price * item.quantity)}</span>
                                    </div>`).join('')}
                            </div>
                            <div class="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">${action}</div>
                        </div>
                    </div>`;
            }).join('');
        }
        updateTracking();
        setInterval(updateTracking, 1000);
    }

    function renderCheckoutOrderReview() {
        const orderReviewTable = document.querySelector('.woocommerce-checkout-review-order-table tbody');
        const subtotalElement = document.querySelector('.cart-subtotal td bdi');
        const totalElement = document.querySelector('.order-total td strong bdi');
        if (!orderReviewTable) return;

        const cart = getCart();
        let subtotal = 0;
        orderReviewTable.innerHTML = cart.map(item => {
            subtotal += item.price * item.quantity;
            return `
                <tr class="cart_item">
                    <td class="product-name">${item.name} &nbsp;<strong class="product-quantity">&times;&nbsp;${item.quantity}</strong><dl class="variation">${(item.options||'').split(', ').filter(o=>o).map(o=>`<dt>${o}</dt>`).join('')}</dl></td>
                    <td class="product-total"><span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">đ</span> ${formatPrice(item.price * item.quantity).replace('₫', '').trim()}</bdi></span></td>
                </tr>`;
        }).join('');
        
        if (subtotalElement) subtotalElement.innerHTML = `<span class="woocommerce-Price-currencySymbol">đ</span> ${formatPrice(subtotal).replace('₫', '').trim()}`;
        if (totalElement) totalElement.innerHTML = `<span class="woocommerce-Price-currencySymbol">đ</span> ${formatPrice(subtotal).replace('₫', '').trim()}`;

        document.querySelectorAll('input[name="payment_method"]').forEach(radio => {
            radio.onchange = () => {
                document.querySelectorAll('.payment_box').forEach(box => box.style.display = 'none');
                const box = document.querySelector(`.payment_box.payment_method_${radio.value}`);
                if (box) box.style.display = 'block';
            };
        });

        const poBtn = document.getElementById('btn-place-order');
        if (poBtn) {
            poBtn.onclick = () => {
                const method = document.querySelector('input[name="payment_method"]:checked').value;
                if (method === 'qr') document.getElementById('qr-modal').style.display = 'flex';
                else finalizeOrder('Thanh toán thành công!');
            };
        }
        const paidBtn = document.getElementById('btn-paid');
        if (paidBtn) paidBtn.onclick = () => finalizeOrder('Đã thanh toán thành công!');
        const closeQr = document.getElementById('btn-close-qr');
        if (closeQr) closeQr.onclick = () => document.getElementById('qr-modal').style.display = 'none';
    }

    function finalizeOrder(message) {
        const cart = getCart();
        if (cart.length === 0) return;
        const orderData = {
            id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
            customerName: document.getElementById('billing_first_name')?.value || 'Khách hàng',
            phone: document.getElementById('billing_phone')?.value || '',
            tableInfo: document.getElementById('billing_address_1')?.value || '',
            district: document.querySelector('#billing_country option:checked')?.textContent || '',
            items: cart,
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            timestamp: new Date().getTime()
        };
        const history = JSON.parse(localStorage.getItem('pizzaOrders')) || [];
        history.unshift(orderData);
        localStorage.setItem('pizzaOrders', JSON.stringify(history));
        alert(message);
        localStorage.removeItem('pizzaCart');
        window.location.href = getRootPath() + 'account/donhang.html';
    }

    function renderCart() {
        if (!cartContainer) return;
        const cart = getCart();
        if (cart.length === 0) {
            cartContainer.innerHTML = '';
            if (cartEmptyMessage) cartEmptyMessage.style.display = 'block';
            return;
        }
        if (cartEmptyMessage) cartEmptyMessage.style.display = 'none';

        let subtotal = 0;
        const itemsHTML = cart.map((item, index) => {
            subtotal += item.price * item.quantity;
            return `
                <tr class="cart_item">
                    <td class="product-remove"><span class="remove-item" data-index="${index}" style="cursor:pointer; color:red; font-size: 24px;">&times;</span></td>
                    <td class="product-thumbnail"><img src="${item.image}" width="80"></td>
                    <td class="product-name">${item.name}<div style="font-size: 0.8em; color: #666;">${item.options}</div></td>
                    <td>${formatPrice(item.price)}</td>
                    <td><input type="number" class="quantity-input" value="${item.quantity}" min="0" data-index="${index}" style="width: 50px;"></td>
                    <td>${formatPrice(item.price * item.quantity)}</td>
                </tr>`;
        }).join('');

        const root = getRootPath();
        cartContainer.innerHTML = `
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 30px;">
                <div>
                    <table class="shop_table cart">
                        <thead><tr><th></th><th></th><th>Sản phẩm</th><th>Giá</th><th>Số lượng</th><th>Tổng</th></tr></thead>
                        <tbody>${itemsHTML}</tbody>
                    </table>
                </div>
                <div class="cart_totals">
                    <h2>Tổng giỏ hàng</h2>
                    <table class="shop_table">
                        <tr><th>Tạm tính</th><td>${formatPrice(subtotal)}</td></tr>
                        <tr><th>Tổng cộng</th><td><strong>${formatPrice(subtotal)}</strong></td></tr>
                    </table>
                    <button id="checkout-btn" class="button alt" style="width:100%; margin-top:20px;">Tiến hành thanh toán</button>
                </div>
            </div>`;

        cartContainer.querySelectorAll('.quantity-input').forEach(input => {
            input.onchange = (e) => {
                let c = getCart();
                if (e.target.value <= 0) c.splice(e.target.dataset.index, 1);
                else c[e.target.dataset.index].quantity = parseInt(e.target.value);
                saveCart(c); renderCart();
            };
        });
        cartContainer.querySelectorAll('.remove-item').forEach(btn => {
            btn.onclick = (e) => {
                let c = getCart(); c.splice(e.target.dataset.index, 1);
                saveCart(c); renderCart();
            };
        });
        const cBtn = document.getElementById('checkout-btn');
        if (cBtn) cBtn.onclick = () => window.location.href = root + 'checkout.html';
    }

    const addToCartForm = document.querySelector('form.cart');
    if (addToCartForm) {
        addToCartForm.onsubmit = function (e) {
            e.preventDefault();
            const name = document.querySelector('.product_title').textContent.trim();
            const img = document.querySelector('.woocommerce-product-gallery__image img').src;
            const qty = parseInt(document.querySelector('input[name="quantity"]').value);
            let price = parseFloat(document.querySelector('.wapf-product-totals').dataset.productPrice) * 1000;
            let opts = [];
            addToCartForm.querySelectorAll('input:checked').forEach(opt => {
                if (opt.dataset.wapfPrice) price += parseFloat(opt.dataset.wapfPrice) * 1000;
                const lbl = opt.parentElement.querySelector('.wapf-label-text');
                if (lbl) opts.push(lbl.textContent.replace(/\(.+\)/, '').trim());
            });
            const cart = getCart();
            const exist = cart.findIndex(i => i.name === name && i.options === opts.join(', '));
            if (exist > -1) cart[exist].quantity += qty;
            else cart.push({ id: Date.now(), name, price, quantity: qty, image: img, options: opts.join(', ') });
            saveCart(cart);
            alert('Đã thêm vào giỏ hàng!');
            window.location.href = getRootPath() + 'cart.html';
        };
    }

    updateCartCount(); renderMiniCart();
    if (cartContainer) renderCart();
    renderCheckoutOrderReview();
    initOrderTracking();
    initModalClose();
    if (document.getElementById('admin-order-count')) {
        const orders = JSON.parse(localStorage.getItem('pizzaOrders')) || [];
        document.getElementById('admin-order-count').textContent = orders.length;
        if (document.getElementById('dashboard-total-orders')) 
            document.getElementById('dashboard-total-orders').textContent = orders.length;
    }
});
