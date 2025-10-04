class ProductsApp {
    constructor() {
        this.products = [];
        this.selectedColors = {};
        this.currentImages = {};
        this.slider = null;
        this.goldPrice = 0;
        this.init();
    }

    async init() {
        await this.fetchGoldPrice();
        await this.loadProducts();
        this.renderProducts();
        this.setupCarousel();
        this.setupEventListeners();
    }

    async fetchGoldPrice() {
        try {
            const response = await fetch('https://api.metals.live/v1/spot/gold');
            const data = await response.json();
            this.goldPrice = data[0].price; // USD per ounce
            
            
            this.goldPrice = this.goldPrice / 28.3495;
        } catch (error) {
            console.error('Altın fiyatı alınırken hata oluştu:', error);
            
            this.goldPrice = 65; // USD per gram
        }
    }

    async loadProducts() {
        const loading = document.getElementById('loading');
        loading.classList.add('show');

        try {
            
            const response = await fetch('http://localhost:5090/api/products'); // Backend URL'ini buraya yaz
            this.products = await response.json();
            
            
            this.products.forEach(product => {
                product.price = this.calculatePrice(product);
                this.selectedColors[product.name] = Object.keys(product.images)[0];
                this.currentImages[product.name] = 0;
            });

        } catch (error) {
            console.error('Ürünler yüklenirken hata oluştu:', error);
            await this.loadLocalProducts();
        } finally {
            loading.classList.remove('show');
        }
    }

    async loadLocalProducts() {
        this.products = [
            {
                "name": "Engagement Ring 1",
                "popularityScore": 0.85,
                "weight": 2.1,
                "images": {
                    "yellow": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG085-100P-Y.jpg?v=1696588368",
                    "rose": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG085-100P-R.jpg?v=1696588406",
                    "white": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG085-100P-W.jpg?v=1696588402"
                }
            },
            {
                "name": "Engagement Ring 2",
                "popularityScore": 0.51,
                "weight": 3.4,
                "images": {
                    "yellow": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG012-Y.jpg?v=1707727068",
                    "rose": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG012-R.jpg?v=1707727068",
                    "white": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG012-W.jpg?v=1707727068"
                }
            },
            {
                "name": "Engagement Ring 3",
                "popularityScore": 0.92,
                "weight": 3.8,
                "images": {
                    "yellow": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG020-100P-Y.jpg?v=1683534032",
                    "rose": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG020-100P-R.jpg?v=1683534032",
                    "white": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG020-100P-W.jpg?v=1683534032"
                }
            },
            {
                "name": "Engagement Ring 4",
                "popularityScore": 0.88,
                "weight": 4.5,
                "images": {
                    "yellow": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG022-100P-Y.jpg?v=1683532153",
                    "rose": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG022-100P-R.jpg?v=1683532153",
                    "white": "https://cdn.shopify.com/s/files/1/0484/1429/4167/files/EG022-100P-W.jpg?v=1683532153"
                }
            }
        ];
        
        
        this.products.forEach(product => {
            product.price = this.calculatePrice(product);
            this.selectedColors[product.name] = Object.keys(product.images)[0];
            this.currentImages[product.name] = 0;
        });
    }

    calculatePrice(product) {
        
        return ((product.popularityScore + 1) * product.weight * this.goldPrice).toFixed(2);
    }

    renderProducts() {
        const productsSlider = document.getElementById('productsSlider');
        
        if (this.products.length === 0) {
            productsSlider.innerHTML = '<div class="no-products">No products found</div>';
            return;
        }

        productsSlider.innerHTML = this.products.map((product, index) => this.createProductCard(product, index)).join('');
    }

    createProductCard(product, index) {
    const colors = Object.keys(product.images);
    const currentColor = this.selectedColors[product.name];
    const rating = this.calculateRating(product.popularityScore);

    return `
        <div class="product-card" data-product-id="${product.name}">
            <div class="product-image">
                <img src="${product.images[currentColor]}" alt="${product.name}" class="product-img">
            </div>
            
            <div class="product-details">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">$${product.price} USD</div>
                
                <div class="color-info-container">
                    <div class="color-options">
                        ${colors.map(color => `
                            <div class="color-option ${currentColor === color ? 'active' : ''}" 
                                 data-color="${color}"
                                 data-product="${product.name}">
                                <div class="color-circle ${color}-gold-color"></div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="color-name">${this.formatColorName(currentColor)}</div>
                </div>

                <div class="product-rating">
                    <span class="stars">${this.generateStars(rating)}</span>
                    <span class="rating-value">${rating}/5</span>
                </div>
            </div>
        </div>
    `;
}

formatColorName(color) {
    const colorMap = {
        'yellow': 'Yellow Gold',
        'rose': 'Rose Gold', 
        'white': 'White Gold'
    };
    return colorMap[color] || color;
}

    calculateRating(popularityScore) {
        return (popularityScore * 5).toFixed(1);
    }

    generateStars(rating) {
        const numRating = parseFloat(rating);
        const fullStars = Math.floor(numRating);
        const hasHalfStar = numRating % 1 >= 0.5;
        
        let stars = '';
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars += '★';
            } else if (i === fullStars && hasHalfStar) {
                stars += '★';
            } else {
                stars += '☆';
            }
        }
        return stars;
    }

    formatColorName(color) {
        return color.charAt(0).toUpperCase() + color.slice(1) + ' Gold';
    }

    setupCarousel() {
        this.slider = document.getElementById('productsSlider');
    }

setupEventListeners() {
    console.log('=== EVENT LISTENERS KURULUYOR ===');
    
    
    this.slider = document.getElementById('productsSlider');
    
   
    const leftArrow = document.querySelector('.left-arrow');
    const rightArrow = document.querySelector('.right-arrow');

    console.log('Left arrow:', leftArrow);
    console.log('Right arrow:', rightArrow);
    console.log('Slider:', this.slider);
    console.log('Ürün sayısı:', this.products.length);

    
    if (leftArrow) {
        leftArrow.onclick = () => {
            console.log('LEFT OKU TIKLANDI');
            console.log('ScrollLeft before:', this.slider.scrollLeft);
            console.log('ScrollWidth:', this.slider.scrollWidth);
            console.log('ClientWidth:', this.slider.clientWidth);
            
            const cardWidth = 280 + 20; // product-card width + gap
            this.slider.scrollBy({ left: -cardWidth, behavior: 'smooth' });
            
            setTimeout(() => {
                console.log('ScrollLeft after:', this.slider.scrollLeft);
            }, 100);
        };
    }

    if (rightArrow) {
        rightArrow.onclick = () => {
            console.log('RIGHT OKU TIKLANDI');
            console.log('ScrollLeft before:', this.slider.scrollLeft);
            console.log('ScrollWidth:', this.slider.scrollWidth);
            console.log('ClientWidth:', this.slider.clientWidth);
            
            const cardWidth = 280 + 20; // product-card width + gap
            this.slider.scrollBy({ left: cardWidth, behavior: 'smooth' });
            
            setTimeout(() => {
                console.log('ScrollLeft after:', this.slider.scrollLeft);
            }, 100);
        };
    }

   
    document.addEventListener('click', (e) => {
        const colorOption = e.target.closest('.color-option');
        if (colorOption) {
            const productName = colorOption.getAttribute('data-product');
            const color = colorOption.getAttribute('data-color');
            this.changeColor(productName, color);
        }
    });

    this.setupSwipeEvents();
}
scrollCarousel(direction) {
    console.log('ScrollCarousel çağrıldı:', direction);
    const cardWidth = 300; // Ürün kartı genişliği + gap
    const scrollAmount = cardWidth;
    
    if (direction === 'left') {
        this.slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else if (direction === 'right') {
        this.slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
}

setupSwipeEvents() {
    let startX = 0;
    let endX = 0;

    this.slider.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });

    this.slider.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        this.handleSwipe(startX, endX);
    });

   
    this.slider.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        const onMouseUp = (e) => {
            endX = e.clientX;
            this.handleSwipe(startX, endX);
            document.removeEventListener('mouseup', onMouseUp);
        };
        document.addEventListener('mouseup', onMouseUp);
    });
}

handleSwipe(startX, endX) {
    const swipeThreshold = 50;
    const diff = startX - endX;

    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            
            this.scrollCarousel('right');
        } else {
           
            this.scrollCarousel('left');
        }
    }
}

    changeColor(productName, color) {
        this.selectedColors[productName] = color;
        
        const productCard = document.querySelector(`[data-product-id="${productName}"]`);
        if (productCard) {
            
            const colorNameElement = productCard.querySelector('.color-name');
            colorNameElement.textContent = this.formatColorName(color);
            
            
            const colorOptions = productCard.querySelectorAll('.color-option');
            colorOptions.forEach(option => {
                option.classList.remove('active');
                if (option.getAttribute('data-color') === color) {
                    option.classList.add('active');
                }
            });
            
            
            const product = this.products.find(p => p.name === productName);
            const imgElement = productCard.querySelector('.product-img');
            if (product && imgElement) {
                imgElement.src = product.images[color];
            }
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    new ProductsApp();
});