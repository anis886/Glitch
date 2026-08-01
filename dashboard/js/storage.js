/**
 * Glitch Bistro - Storage & Data Management System
 * Handles LocalStorage initialization, demo data seeding, and business calculations.
 */

const STORAGE_KEYS = {
    AUTH_SESSION: 'gb_auth_session',
    ORDERS: 'gb_orders',
    MENU: 'gb_menu',
    CUSTOMERS: 'gb_customers',
    SETTINGS: 'gb_settings',
    NOTIFICATIONS: 'gb_notifications',
    UI_PREFS: 'gb_ui_prefs'
};

const DEFAULT_SETTINGS = {
    restaurantName: 'Glitch Bistro & Lounge',
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 234-5678',
    email: 'contact@glitchbistro.com',
    address: '104 Tech Boulevard, Cyber District, NY 10001',
    currency: '$',
    taxRate: 14, // 14%
    defaultDeliveryFee: 4.99,
    enableDelivery: true,
    enableTakeaway: true,
    enableDineIn: true,
    autoConfirmOrders: false,
    defaultPrepTime: 25,
    receiptHeader: 'Welcome to Glitch Bistro! We hope you enjoyed your meal.',
    receiptFooter: 'Follow us @glitchbistro | Wi-Fi: GlitchGuest2026',
    showTaxOnReceipt: true,
    showCustomerOnReceipt: true,
    theme: 'dark',
    accentColor: 'cyan'
};

const DEFAULT_MENU = [
    {
        id: 'MNU-101',
        name: 'Glitch Smash Burger',
        category: 'Burgers',
        price: 14.99,
        description: 'Double Angus beef patty, melted cheddar, caramelized onions, smoked bacon jam & signature glitch sauce on brioche.',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
        prepTime: 15,
        available: true,
        featured: true,
        salesCount: 142
    },
    {
        id: 'MNU-102',
        name: 'Truffle Mushroom Burger',
        category: 'Burgers',
        price: 16.50,
        description: 'Swiss cheese, sauteed wild mushrooms, black truffle aioli, baby arugula & crispy shallots.',
        image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=80',
        prepTime: 15,
        available: true,
        featured: false,
        salesCount: 88
    },
    {
        id: 'MNU-103',
        name: 'Bacon Double Cheese Burger',
        category: 'Burgers',
        price: 15.99,
        description: 'Classic double cheddar beef burger with applewood smoked bacon and smoky barbecue glaze.',
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80',
        prepTime: 12,
        available: true,
        featured: true,
        salesCount: 110
    },
    {
        id: 'MNU-201',
        name: 'Margherita Supreme Pizza',
        category: 'Pizza',
        price: 18.00,
        description: 'San Marzano tomato sauce, fresh mozzarella di bufala, organic basil, extra virgin olive oil.',
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=80',
        prepTime: 20,
        available: true,
        featured: true,
        salesCount: 165
    },
    {
        id: 'MNU-202',
        name: 'Pepperoni Overload Pizza',
        category: 'Pizza',
        price: 21.99,
        description: 'Double artisanal pepperoni, spicy honey drizzle, mozzarella, oregano crust.',
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=80',
        prepTime: 20,
        available: true,
        featured: true,
        salesCount: 204
    },
    {
        id: 'MNU-203',
        name: 'Quattro Formaggi',
        category: 'Pizza',
        price: 22.50,
        description: 'Blend of Gorgonzola piccante, fontina, mozzarella, and Parmigiano-Reggiano with white cream base.',
        image: 'https://images.unsplash.com/photo-1573821663912-569905455b1c?w=500&auto=format&fit=crop&q=80',
        prepTime: 18,
        available: true,
        featured: false,
        salesCount: 75
    },
    {
        id: 'MNU-301',
        name: 'Prime Ribeye Steak 12oz',
        category: 'Main Meals',
        price: 34.99,
        description: 'USDA Prime dry-aged ribeye steak, rosemary garlic butter, roasted asparagus, truffled mashed potatoes.',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
        prepTime: 25,
        available: true,
        featured: true,
        salesCount: 94
    },
    {
        id: 'MNU-302',
        name: 'Creamy Tuscan Chicken',
        category: 'Main Meals',
        price: 24.50,
        description: 'Pan-seared chicken breast in sun-dried tomato and spinach cream sauce over fettuccine.',
        image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=500&auto=format&fit=crop&q=80',
        prepTime: 22,
        available: true,
        featured: false,
        salesCount: 118
    },
    {
        id: 'MNU-303',
        name: 'Pan-Seared Atlantic Salmon',
        category: 'Main Meals',
        price: 28.00,
        description: 'Fresh salmon fillet, lemon dill butter sauce, quinoa vegetable pilaf, charred broccolini.',
        image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=80',
        prepTime: 20,
        available: true,
        featured: false,
        salesCount: 62
    },
    {
        id: 'MNU-401',
        name: 'Crispy Truffle Parmesan Fries',
        category: 'Appetizers',
        price: 9.99,
        description: 'Hand-cut russet fries tossed with white truffle oil, grated aged parmesan, and fresh parsley.',
        image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&auto=format&fit=crop&q=80',
        prepTime: 10,
        available: true,
        featured: false,
        salesCount: 230
    },
    {
        id: 'MNU-402',
        name: 'Artisanal Mozzarella Sticks',
        category: 'Appetizers',
        price: 11.50,
        description: 'Herb-crusted whole milk mozzarella served with warm roasted garlic marinara.',
        image: 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=500&auto=format&fit=crop&q=80',
        prepTime: 10,
        available: true,
        featured: false,
        salesCount: 185
    },
    {
        id: 'MNU-403',
        name: 'Glitch Buffalo Wings (10pcs)',
        category: 'Appetizers',
        price: 14.50,
        description: 'Jumbo wings tossed in house cayenne glaze or tangy BBQ, served with Gorgonzola dip and celery.',
        image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=80',
        prepTime: 15,
        available: true,
        featured: true,
        salesCount: 215
    },
    {
        id: 'MNU-501',
        name: 'Signature Iced Caramel Latte',
        category: 'Drinks',
        price: 6.50,
        description: 'Double espresso shot, cold whole milk, salted caramel drizzle over ice.',
        image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80',
        prepTime: 5,
        available: true,
        featured: false,
        salesCount: 310
    },
    {
        id: 'MNU-502',
        name: 'Dragonfruit Sparkling Lemonade',
        category: 'Drinks',
        price: 5.99,
        description: 'Fresh pink dragonfruit, meyer lemon juice, sparkling mineral water, mint sprig.',
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
        prepTime: 5,
        available: true,
        featured: true,
        salesCount: 280
    },
    {
        id: 'MNU-503',
        name: 'Electric Berry Smoothie',
        category: 'Drinks',
        price: 7.25,
        description: 'Acai, blueberries, strawberries, Greek yogurt, chia seeds, and raw honey.',
        image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=80',
        prepTime: 6,
        available: false, // Demo out of stock
        featured: false,
        salesCount: 95
    },
    {
        id: 'MNU-601',
        name: 'Chocolate Molten Lava Cake',
        category: 'Desserts',
        price: 10.99,
        description: 'Warm Valrhona chocolate cake with molten center, paired with Madagascar vanilla bean ice cream.',
        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80',
        prepTime: 12,
        available: true,
        featured: true,
        salesCount: 156
    },
    {
        id: 'MNU-602',
        name: 'Caramel Cinnamon Churro Bites',
        category: 'Desserts',
        price: 8.99,
        description: 'Crispy fried churro bites dusted in cinnamon sugar, served with warm dulce de leche.',
        image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=500&auto=format&fit=crop&q=80',
        prepTime: 10,
        available: true,
        featured: false,
        salesCount: 140
    },
    {
        id: 'MNU-603',
        name: 'Classic New York Cheesecake',
        category: 'Desserts',
        price: 9.50,
        description: 'Rich cream cheese cake with graham cracker crust and fresh strawberry compote.',
        image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=80',
        prepTime: 5,
        available: true,
        featured: false,
        salesCount: 112
    }
];

const DEFAULT_CUSTOMERS = [
    {
        id: 'CUST-1001',
        name: 'Alex Mercer',
        phone: '+1 (555) 123-4567',
        email: 'alex.mercer@email.com',
        type: 'VIP',
        totalOrders: 18,
        totalSpent: 640.50,
        lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        notes: 'Prefers quiet booth seating. Loves truffle fries.'
    },
    {
        id: 'CUST-1002',
        name: 'Sarah Connor',
        phone: '+1 (555) 987-6543',
        email: 's.connor@cyberdyne.io',
        type: 'VIP',
        totalOrders: 14,
        totalSpent: 485.20,
        lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        notes: 'Allergic to shellfish. Regular Friday delivery.'
    },
    {
        id: 'CUST-1003',
        name: 'David Miller',
        phone: '+1 (555) 456-7890',
        email: 'dmiller@techcorp.com',
        type: 'Regular',
        totalOrders: 8,
        totalSpent: 260.75,
        lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        notes: 'Lunch takeaway customer.'
    },
    {
        id: 'CUST-1004',
        name: 'Elena Rostova',
        phone: '+1 (555) 321-6549',
        email: 'elena.rostova@design.co',
        type: 'VIP',
        totalOrders: 22,
        totalSpent: 890.10,
        lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
        notes: 'Always orders extra dip for pizza.'
    },
    {
        id: 'CUST-1005',
        name: 'Marcus Vance',
        phone: '+1 (555) 789-0123',
        email: 'mvance@startup.io',
        type: 'Regular',
        totalOrders: 6,
        totalSpent: 195.40,
        lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        notes: 'Office group delivery orders.'
    },
    {
        id: 'CUST-1006',
        name: 'Sophia Chen',
        phone: '+1 (555) 654-3210',
        email: 'sophia.c@university.edu',
        type: 'New',
        totalOrders: 2,
        totalSpent: 48.50,
        lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
        notes: 'Loves iced coffees.'
    },
    {
        id: 'CUST-1007',
        name: 'Robert Thorne',
        phone: '+1 (555) 234-8901',
        email: 'rthorne@lawfirm.com',
        type: 'Regular',
        totalOrders: 9,
        totalSpent: 340.00,
        lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        notes: 'Dine-in dinner regular.'
    },
    {
        id: 'CUST-1008',
        name: 'Olivia Martinez',
        phone: '+1 (555) 876-5432',
        email: 'omartinez@studio.net',
        type: 'New',
        totalOrders: 1,
        totalSpent: 32.99,
        lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        notes: 'First time delivery customer.'
    },
    {
        id: 'CUST-1009',
        name: 'James Wright',
        phone: '+1 (555) 345-6789',
        email: 'jwright@finance.org',
        type: 'Regular',
        totalOrders: 7,
        totalSpent: 220.80,
        lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
        notes: 'Takes Ribeye rare.'
    },
    {
        id: 'CUST-1010',
        name: 'Emily Watson',
        phone: '+1 (555) 432-1098',
        email: 'emily.w@creative.com',
        type: 'New',
        totalOrders: 1,
        totalSpent: 41.50,
        lastOrderDate: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        notes: 'Requested extra napkins.'
    }
];

// Seed generator for 20 realistic orders spanning the last 14 days
function generateSeedOrders() {
    const now = Date.now();
    const HOUR = 1000 * 60 * 60;
    const DAY = HOUR * 24;

    return [
        {
            id: 'ORD-5001',
            customerName: 'Alex Mercer',
            customerPhone: '+1 (555) 123-4567',
            type: 'dine-in',
            tableNumber: 'Table 04',
            deliveryAddress: '',
            status: 'completed',
            paymentMethod: 'visa',
            paymentStatus: 'paid',
            items: [
                { id: 'MNU-101', name: 'Glitch Smash Burger', price: 14.99, quantity: 2 },
                { id: 'MNU-401', name: 'Crispy Truffle Parmesan Fries', price: 9.99, quantity: 1 },
                { id: 'MNU-501', name: 'Signature Iced Caramel Latte', price: 6.50, quantity: 2 }
            ],
            notes: 'Extra burger sauce on the side please.',
            createdAt: new Date(now - HOUR * 1.5).toISOString(),
            subtotal: 52.97,
            tax: 7.42,
            deliveryFee: 0,
            discount: 5.00,
            total: 55.39
        },
        {
            id: 'ORD-5002',
            customerName: 'Sarah Connor',
            customerPhone: '+1 (555) 987-6543',
            type: 'delivery',
            tableNumber: '',
            deliveryAddress: '742 Evergreen Terrace, Sector 4',
            status: 'preparing',
            paymentMethod: 'online',
            paymentStatus: 'paid',
            items: [
                { id: 'MNU-202', name: 'Pepperoni Overload Pizza', price: 21.99, quantity: 1 },
                { id: 'MNU-403', name: 'Glitch Buffalo Wings (10pcs)', price: 14.50, quantity: 1 },
                { id: 'MNU-502', name: 'Dragonfruit Sparkling Lemonade', price: 5.99, quantity: 2 }
            ],
            notes: 'Ring doorbell and leave at doorstep.',
            createdAt: new Date(now - HOUR * 0.5).toISOString(),
            subtotal: 48.47,
            tax: 6.79,
            deliveryFee: 4.99,
            discount: 0,
            total: 60.25
        },
        {
            id: 'ORD-5003',
            customerName: 'Emily Watson',
            customerPhone: '+1 (555) 432-1098',
            type: 'takeaway',
            tableNumber: '',
            deliveryAddress: '',
            status: 'new',
            paymentMethod: 'cash',
            paymentStatus: 'pending',
            items: [
                { id: 'MNU-302', name: 'Creamy Tuscan Chicken', price: 24.50, quantity: 1 },
                { id: 'MNU-601', name: 'Chocolate Molten Lava Cake', price: 10.99, quantity: 1 }
            ],
            notes: 'Pack cutlery for takeaway.',
            createdAt: new Date(now - 1000 * 60 * 15).toISOString(),
            subtotal: 35.49,
            tax: 4.97,
            deliveryFee: 0,
            discount: 0,
            total: 40.46
        },
        {
            id: 'ORD-5004',
            customerName: 'David Miller',
            customerPhone: '+1 (555) 456-7890',
            type: 'dine-in',
            tableNumber: 'Table 08',
            deliveryAddress: '',
            status: 'ready',
            paymentMethod: 'visa',
            paymentStatus: 'paid',
            items: [
                { id: 'MNU-301', name: 'Prime Ribeye Steak 12oz', price: 34.99, quantity: 1 },
                { id: 'MNU-501', name: 'Signature Iced Caramel Latte', price: 6.50, quantity: 1 }
            ],
            notes: 'Steak cooked medium-rare.',
            createdAt: new Date(now - HOUR * 1.1).toISOString(),
            subtotal: 41.49,
            tax: 5.81,
            deliveryFee: 0,
            discount: 0,
            total: 47.30
        },
        {
            id: 'ORD-5005',
            customerName: 'Elena Rostova',
            customerPhone: '+1 (555) 321-6549',
            type: 'delivery',
            tableNumber: '',
            deliveryAddress: '128 Cyber Avenue, Apt 4B',
            status: 'confirmed',
            paymentMethod: 'wallet',
            paymentStatus: 'paid',
            items: [
                { id: 'MNU-201', name: 'Margherita Supreme Pizza', price: 18.00, quantity: 2 },
                { id: 'MNU-402', name: 'Artisanal Mozzarella Sticks', price: 11.50, quantity: 1 },
                { id: 'MNU-602', name: 'Caramel Cinnamon Churro Bites', price: 8.99, quantity: 1 }
            ],
            notes: 'Extra garlic sauce.',
            createdAt: new Date(now - HOUR * 2.2).toISOString(),
            subtotal: 56.49,
            tax: 7.91,
            deliveryFee: 4.99,
            discount: 5.00,
            total: 64.39
        },
        {
            id: 'ORD-5006',
            customerName: 'Marcus Vance',
            customerPhone: '+1 (555) 789-0123',
            type: 'takeaway',
            tableNumber: '',
            deliveryAddress: '',
            status: 'cancelled',
            paymentMethod: 'cash',
            paymentStatus: 'cancelled',
            items: [
                { id: 'MNU-102', name: 'Truffle Mushroom Burger', price: 16.50, quantity: 1 },
                { id: 'MNU-401', name: 'Crispy Truffle Parmesan Fries', price: 9.99, quantity: 1 }
            ],
            notes: 'Customer cancelled before prep.',
            createdAt: new Date(now - HOUR * 4).toISOString(),
            subtotal: 26.49,
            tax: 3.71,
            deliveryFee: 0,
            discount: 0,
            total: 30.20
        },
        {
            id: 'ORD-5007',
            customerName: 'Olivia Martinez',
            customerPhone: '+1 (555) 876-5432',
            type: 'delivery',
            tableNumber: '',
            deliveryAddress: '55 Ocean View Drive',
            status: 'completed',
            paymentMethod: 'online',
            paymentStatus: 'paid',
            items: [
                { id: 'MNU-103', name: 'Bacon Double Cheese Burger', price: 15.99, quantity: 1 },
                { id: 'MNU-603', name: 'Classic New York Cheesecake', price: 9.50, quantity: 1 }
            ],
            notes: '',
            createdAt: new Date(now - DAY * 1 - HOUR * 3).toISOString(),
            subtotal: 25.49,
            tax: 3.57,
            deliveryFee: 4.99,
            discount: 0,
            total: 34.05
        },
        {
            id: 'ORD-5008',
            customerName: 'Robert Thorne',
            customerPhone: '+1 (555) 234-8901',
            type: 'dine-in',
            tableNumber: 'Table 12',
            deliveryAddress: '',
            status: 'completed',
            paymentMethod: 'visa',
            paymentStatus: 'paid',
            items: [
                { id: 'MNU-301', name: 'Prime Ribeye Steak 12oz', price: 34.99, quantity: 2 },
                { id: 'MNU-303', name: 'Pan-Seared Atlantic Salmon', price: 28.00, quantity: 1 },
                { id: 'MNU-601', name: 'Chocolate Molten Lava Cake', price: 10.99, quantity: 2 }
            ],
            notes: 'Anniversary celebration toast.',
            createdAt: new Date(now - DAY * 1 - HOUR * 6).toISOString(),
            subtotal: 119.96,
            tax: 16.79,
            deliveryFee: 0,
            discount: 10.00,
            total: 126.75
        },
        {
            id: 'ORD-5009',
            customerName: 'Sophia Chen',
            customerPhone: '+1 (555) 654-3210',
            type: 'takeaway',
            tableNumber: '',
            deliveryAddress: '',
            status: 'completed',
            paymentMethod: 'wallet',
            paymentStatus: 'paid',
            items: [
                { id: 'MNU-203', name: 'Quattro Formaggi', price: 22.50, quantity: 1 },
                { id: 'MNU-502', name: 'Dragonfruit Sparkling Lemonade', price: 5.99, quantity: 1 }
            ],
            notes: '',
            createdAt: new Date(now - DAY * 2 - HOUR * 2).toISOString(),
            subtotal: 28.49,
            tax: 3.99,
            deliveryFee: 0,
            discount: 0,
            total: 32.48
        },
        {
            id: 'ORD-5010',
            customerName: 'James Wright',
            customerPhone: '+1 (555) 345-6789',
            type: 'dine-in',
            tableNumber: 'Table 02',
            deliveryAddress: '',
            status: 'completed',
            paymentMethod: 'cash',
            paymentStatus: 'paid',
            items: [
                { id: 'MNU-101', name: 'Glitch Smash Burger', price: 14.99, quantity: 1 },
                { id: 'MNU-403', name: 'Glitch Buffalo Wings (10pcs)', price: 14.50, quantity: 1 },
                { id: 'MNU-501', name: 'Signature Iced Caramel Latte', price: 6.50, quantity: 1 }
            ],
            notes: '',
            createdAt: new Date(now - DAY * 3 - HOUR * 5).toISOString(),
            subtotal: 35.99,
            tax: 5.04,
            deliveryFee: 0,
            discount: 0,
            total: 41.03
        },
        {
            id: 'ORD-5011',
            customerName: 'Alex Mercer',
            customerPhone: '+1 (555) 123-4567',
            type: 'delivery',
            tableNumber: '',
            deliveryAddress: '99 Central Park West',
            status: 'completed',
            paymentMethod: 'visa',
            paymentStatus: 'paid',
            items: [
                { id: 'MNU-202', name: 'Pepperoni Overload Pizza', price: 21.99, quantity: 2 },
                { id: 'MNU-401', name: 'Crispy Truffle Parmesan Fries', price: 9.99, quantity: 2 }
            ],
            notes: 'Game night delivery.',
            createdAt: new Date(now - DAY * 4 - HOUR * 4).toISOString(),
            subtotal: 63.96,
            tax: 8.95,
            deliveryFee: 4.99,
            discount: 5.00,
            total: 72.90
        },
        {
            id: 'ORD-5012',
            customerName: 'Sarah Connor',
            customerPhone: '+1 (555) 987-6543',
            type: 'dine-in',
            tableNumber: 'Table 06',
            deliveryAddress: '',
            status: 'completed',
            paymentMethod: 'online',
            paymentStatus: 'paid',
            items: [
                { id: 'MNU-302', name: 'Creamy Tuscan Chicken', price: 24.50, quantity: 2 },
                { id: 'MNU-602', name: 'Caramel Cinnamon Churro Bites', price: 8.99, quantity: 1 }
            ],
            notes: '',
            createdAt: new Date(now - DAY * 5 - HOUR * 7).toISOString(),
            subtotal: 57.99,
            tax: 8.12,
            deliveryFee: 0,
            discount: 0,
            total: 66.11
        },
        {
            id: 'ORD-5013',
            customerName: 'Elena Rostova',
            customerPhone: '+1 (555) 321-6549',
            type: 'delivery',
            tableNumber: '',
            deliveryAddress: '128 Cyber Avenue, Apt 4B',
            status: 'completed',
            paymentMethod: 'wallet',
            paymentStatus: 'paid',
            items: [
                { id: 'MNU-102', name: 'Truffle Mushroom Burger', price: 16.50, quantity: 2 },
                { id: 'MNU-502', name: 'Dragonfruit Sparkling Lemonade', price: 5.99, quantity: 2 }
            ],
            notes: '',
            createdAt: new Date(now - DAY * 6 - HOUR * 3).toISOString(),
            subtotal: 44.98,
            tax: 6.30,
            deliveryFee: 4.99,
            discount: 0,
            total: 56.27
        },
        {
            id: 'ORD-5014',
            customerName: 'Marcus Vance',
            customerPhone: '+1 (555) 789-0123',
            type: 'takeaway',
            tableNumber: '',
            deliveryAddress: '',
            status: 'completed',
            paymentMethod: 'visa',
            paymentStatus: 'paid',
            items: [
                { id: 'MNU-201', name: 'Margherita Supreme Pizza', price: 18.00, quantity: 3 }
            ],
            notes: '',
            createdAt: new Date(now - DAY * 7 - HOUR * 2).toISOString(),
            subtotal: 54.00,
            tax: 7.56,
            deliveryFee: 0,
            discount: 0,
            total: 61.56
        },
        {
            id: 'ORD-5015',
            customerName: 'David Miller',
            customerPhone: '+1 (555) 456-7890',
            type: 'dine-in',
            tableNumber: 'Table 01',
            deliveryAddress: '',
            status: 'completed',
            paymentMethod: 'cash',
            paymentStatus: 'paid',
            items: [
                { id: 'MNU-303', name: 'Pan-Seared Atlantic Salmon', price: 28.00, quantity: 1 },
                { id: 'MNU-501', name: 'Signature Iced Caramel Latte', price: 6.50, quantity: 1 }
            ],
            notes: '',
            createdAt: new Date(now - DAY * 8 - HOUR * 6).toISOString(),
            subtotal: 34.50,
            tax: 4.83,
            deliveryFee: 0,
            discount: 0,
            total: 39.33
        },
        {
            id: 'ORD-5016',
            customerName: 'Robert Thorne',
            customerPhone: '+1 (555) 234-8901',
            type: 'delivery',
            tableNumber: '',
            deliveryAddress: '200 Madison Plaza',
            status: 'completed',
            paymentMethod: 'online',
            paymentStatus: 'paid',
            items: [
                { id: 'MNU-101', name: 'Glitch Smash Burger', price: 14.99, quantity: 3 },
                { id: 'MNU-402', name: 'Artisanal Mozzarella Sticks', price: 11.50, quantity: 2 }
            ],
            notes: '',
            createdAt: new Date(now - DAY * 9 - HOUR * 4).toISOString(),
            subtotal: 67.97,
            tax: 9.52,
            deliveryFee: 4.99,
            discount: 5.00,
            total: 77.48
        },
        {
            id: 'ORD-5017',
            customerName: 'Sophia Chen',
            customerPhone: '+1 (555) 654-3210',
            type: 'dine-in',
            tableNumber: 'Table 03',
            deliveryAddress: '',
            status: 'completed',
            paymentMethod: 'visa',
            paymentStatus: 'paid',
            items: [
                { id: 'MNU-202', name: 'Pepperoni Overload Pizza', price: 21.99, quantity: 1 },
                { id: 'MNU-601', name: 'Chocolate Molten Lava Cake', price: 10.99, quantity: 1 }
            ],
            notes: '',
            createdAt: new Date(now - DAY * 10 - HOUR * 5).toISOString(),
            subtotal: 32.98,
            tax: 4.62,
            deliveryFee: 0,
            discount: 0,
            total: 37.60
        },
        {
            id: 'ORD-5018',
            customerName: 'James Wright',
            customerPhone: '+1 (555) 345-6789',
            type: 'takeaway',
            tableNumber: '',
            deliveryAddress: '',
            status: 'completed',
            paymentMethod: 'cash',
            paymentStatus: 'paid',
            items: [
                { id: 'MNU-103', name: 'Bacon Double Cheese Burger', price: 15.99, quantity: 2 },
                { id: 'MNU-401', name: 'Crispy Truffle Parmesan Fries', price: 9.99, quantity: 1 }
            ],
            notes: '',
            createdAt: new Date(now - DAY * 11 - HOUR * 3).toISOString(),
            subtotal: 41.97,
            tax: 5.88,
            deliveryFee: 0,
            discount: 0,
            total: 47.85
        },
        {
            id: 'ORD-5019',
            customerName: 'Olivia Martinez',
            customerPhone: '+1 (555) 876-5432',
            type: 'dine-in',
            tableNumber: 'Table 05',
            deliveryAddress: '',
            status: 'completed',
            paymentMethod: 'visa',
            paymentStatus: 'paid',
            items: [
                { id: 'MNU-301', name: 'Prime Ribeye Steak 12oz', price: 34.99, quantity: 1 },
                { id: 'MNU-603', name: 'Classic New York Cheesecake', price: 9.50, quantity: 1 }
            ],
            notes: '',
            createdAt: new Date(now - DAY * 12 - HOUR * 6).toISOString(),
            subtotal: 44.49,
            tax: 6.23,
            deliveryFee: 0,
            discount: 0,
            total: 50.72
        },
        {
            id: 'ORD-5020',
            customerName: 'Alex Mercer',
            customerPhone: '+1 (555) 123-4567',
            type: 'takeaway',
            tableNumber: '',
            deliveryAddress: '',
            status: 'completed',
            paymentMethod: 'online',
            paymentStatus: 'paid',
            items: [
                { id: 'MNU-201', name: 'Margherita Supreme Pizza', price: 18.00, quantity: 2 },
                { id: 'MNU-403', name: 'Glitch Buffalo Wings (10pcs)', price: 14.50, quantity: 1 }
            ],
            notes: '',
            createdAt: new Date(now - DAY * 13 - HOUR * 2).toISOString(),
            subtotal: 50.50,
            tax: 7.07,
            deliveryFee: 0,
            discount: 0,
            total: 57.57
        }
    ];
}

const DEFAULT_NOTIFICATIONS = [
    {
        id: 'NOTIF-1',
        title: 'New Order Received',
        message: 'Order #ORD-5003 from Emily Watson requires confirmation.',
        type: 'order',
        read: false,
        time: new Date(Date.now() - 1000 * 60 * 15).toISOString()
    },
    {
        id: 'NOTIF-2',
        title: 'Item Out of Stock',
        message: 'Electric Berry Smoothie has been marked unavailable.',
        type: 'inventory',
        read: false,
        time: new Date(Date.now() - 1000 * 60 * 120).toISOString()
    },
    {
        id: 'NOTIF-3',
        title: 'Order Cancelled',
        message: 'Order #ORD-5006 was cancelled by customer.',
        type: 'warning',
        read: true,
        time: new Date(Date.now() - 1000 * 60 * 240).toISOString()
    },
    {
        id: 'NOTIF-4',
        title: 'Low Performing Item',
        message: 'Pan-Seared Atlantic Salmon sales down 15% this week.',
        type: 'info',
        read: true,
        time: new Date(Date.now() - 1000 * 60 * 600).toISOString()
    }
];

// --- Storage Helper Functions ---

function getStorage(key, fallback = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (e) {
        console.error(`Error reading ${key} from LocalStorage:`, e);
        return fallback;
    }
}

function setStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error(`Error saving ${key} to LocalStorage:`, e);
    }
}

function initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
        setStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.MENU)) {
        setStorage(STORAGE_KEYS.MENU, DEFAULT_MENU);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
        setStorage(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
        setStorage(STORAGE_KEYS.ORDERS, generateSeedOrders());
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
        setStorage(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
    }
}

function resetDemoData() {
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.MENU);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    initStorage();
}

// Execute initial seeding immediately
initStorage();

// --- Dynamic Business Calculations ---

function getSettings() {
    return getStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

function getOrders() {
    return getStorage(STORAGE_KEYS.ORDERS, []);
}

function getMenu() {
    return getStorage(STORAGE_KEYS.MENU, []);
}

function getCustomers() {
    return getStorage(STORAGE_KEYS.CUSTOMERS, []);
}

function getNotifications() {
    return getStorage(STORAGE_KEYS.NOTIFICATIONS, []);
}

/**
 * Calculates item subtotal, tax, delivery fee, discount and final total for an order.
 * Cancelled orders are excluded from revenue totals when querying dashboard.
 */
function calculateOrderTotals(items, orderType, discountAmount = 0) {
    const settings = getSettings();
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * parseInt(item.quantity)), 0);
    const tax = subtotal * (settings.taxRate / 100);
    const deliveryFee = (orderType === 'delivery' && settings.enableDelivery) ? parseFloat(settings.defaultDeliveryFee) : 0;
    const discount = parseFloat(discountAmount) || 0;
    const total = Math.max(0, subtotal + tax + deliveryFee - discount);

    return {
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        deliveryFee: parseFloat(deliveryFee.toFixed(2)),
        discount: parseFloat(discount.toFixed(2)),
        total: parseFloat(total.toFixed(2))
    };
}

/**
 * Returns dynamic stats for Dashboard Overview
 */
function getDashboardStats() {
    const orders = getOrders();
    const menu = getMenu();
    const settings = getSettings();
    const currency = settings.currency || '$';

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - (24 * 60 * 60 * 1000);

    // Filter non-cancelled orders
    const validOrders = orders.filter(o => o.status !== 'cancelled');

    // Today's & Yesterday's orders
    const todayOrders = validOrders.filter(o => new Date(o.createdAt).getTime() >= todayStart);
    const yesterdayOrders = validOrders.filter(o => {
        const time = new Date(o.createdAt).getTime();
        return time >= yesterdayStart && time < todayStart;
    });

    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
    const yesterdayRevenue = yesterdayOrders.reduce((sum, o) => sum + o.total, 0);

    const pendingOrdersCount = orders.filter(o => ['new', 'confirmed', 'preparing', 'ready'].includes(o.status)).length;
    const completedOrdersCount = orders.filter(o => o.status === 'completed').length;

    const completedValidOrders = validOrders.filter(o => o.status === 'completed');
    const totalCompletedRevenue = completedValidOrders.reduce((sum, o) => sum + o.total, 0);
    const avgOrderValue = completedValidOrders.length > 0 ? totalCompletedRevenue / completedValidOrders.length : 0;

    // Percentage changes
    const revenueChange = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : (todayRevenue > 0 ? 100 : 0);
    const ordersChange = yesterdayOrders.length > 0 ? ((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length) * 100 : (todayOrders.length > 0 ? 100 : 0);

    return {
        todayRevenue: parseFloat(todayRevenue.toFixed(2)),
        todayOrdersCount: todayOrders.length,
        pendingOrdersCount,
        completedOrdersCount,
        avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
        totalMenuItems: menu.length,
        revenueChange: parseFloat(revenueChange.toFixed(1)),
        ordersChange: parseFloat(ordersChange.toFixed(1)),
        currency
    };
}

/**
 * Returns dynamic aggregated data for Sales and Reports Page
 */
function getSalesReportData(dateFilter = '7days', customStart = null, customEnd = null) {
    const orders = getOrders();
    const settings = getSettings();
    const now = new Date();
    let startTime = 0;
    let endTime = now.getTime();

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    if (dateFilter === 'today') {
        startTime = todayStart;
    } else if (dateFilter === 'yesterday') {
        startTime = todayStart - (24 * 60 * 60 * 1000);
        endTime = todayStart;
    } else if (dateFilter === '7days') {
        startTime = todayStart - (6 * 24 * 60 * 60 * 1000);
    } else if (dateFilter === 'thisMonth') {
        startTime = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    } else if (dateFilter === 'custom' && customStart && customEnd) {
        startTime = new Date(customStart).getTime();
        endTime = new Date(customEnd).getTime() + (24 * 60 * 60 * 1000);
    }

    const filteredOrders = orders.filter(o => {
        const t = new Date(o.createdAt).getTime();
        return t >= startTime && t <= endTime;
    });

    const validOrders = filteredOrders.filter(o => o.status !== 'cancelled');
    const completedOrders = filteredOrders.filter(o => o.status === 'completed');
    const cancelledOrders = filteredOrders.filter(o => o.status === 'cancelled');

    const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
    const totalDiscounts = validOrders.reduce((sum, o) => sum + (o.discount || 0), 0);
    const totalTax = validOrders.reduce((sum, o) => sum + (o.tax || 0), 0);
    const totalDeliveryFees = validOrders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
    const avgOrderValue = completedOrders.length > 0 ? (completedOrders.reduce((sum, o) => sum + o.total, 0) / completedOrders.length) : 0;

    return {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalOrdersCount: filteredOrders.length,
        completedOrdersCount: completedOrders.length,
        cancelledOrdersCount: cancelledOrders.length,
        avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
        totalDiscounts: parseFloat(totalDiscounts.toFixed(2)),
        totalTax: parseFloat(totalTax.toFixed(2)),
        totalDeliveryFees: parseFloat(totalDeliveryFees.toFixed(2)),
        filteredOrders,
        validOrders,
        currency: settings.currency || '$'
    };
}

/**
 * Synchronizes customer records whenever a new order is added or modified
 */
function updateCustomerFromOrder(order) {
    const customers = getCustomers();
    let customer = customers.find(c => c.name.toLowerCase() === order.customerName.toLowerCase() || c.phone === order.customerPhone);

    if (customer) {
        customer.totalOrders += 1;
        if (order.status !== 'cancelled') {
            customer.totalSpent += order.total;
        }
        customer.lastOrderDate = new Date().toISOString();
        if (customer.totalSpent > 500) customer.type = 'VIP';
        else if (customer.totalOrders > 3) customer.type = 'Regular';
    } else {
        const newCustomer = {
            id: `CUST-${1000 + customers.length + 1}`,
            name: order.customerName,
            phone: order.customerPhone || 'N/A',
            email: `${order.customerName.toLowerCase().replace(/\s+/g, '.')}@user.com`,
            type: 'New',
            totalOrders: 1,
            totalSpent: order.status !== 'cancelled' ? order.total : 0,
            lastOrderDate: new Date().toISOString(),
            notes: `Auto-created from order #${order.id}`
        };
        customers.push(newCustomer);
    }

    setStorage(STORAGE_KEYS.CUSTOMERS, customers);
}

// Utility to escape HTML and prevent XSS
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
