
USE users_db;

DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS workshops;
DROP TABLE IF EXISTS users;

-- Tabla de usuarios
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255)
);

-- Usuario de prueba
INSERT INTO users (name, email, password) VALUES (
    'Admin',
    'admin@mastercook.com',
    '$2b$12$sQpDdb0.V9OgTQ2SKc9Zp.HKmIwLJkkQaA3E3S4dEymO6pT5Es2n2'
);

-- Tabla de talleres con columna 'price'
CREATE TABLE IF NOT EXISTS workshops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100),
    description TEXT,
    category VARCHAR(50),
    date DATE,
    max_participants INT,
    current_participants INT DEFAULT 0,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00
);

-- Inserción de 15 talleres de cocina
INSERT INTO workshops (title, description, category, date, max_participants, price) VALUES
    (
        'Taller de Pasta Italiana',
        'Aprende a preparar desde cero lasaña, raviolis y tagliatelle con salsas tradicionales.',
        'Italiana',
        '2025-06-15',
        12,
        450.00
    ),
    (
        'Panadería Artesanal',
        'Descubre técnicas de fermentación natural y horneado para crear panes rústicos y bollería.',
        'Panadería',
        '2025-07-03',
        10,
        550.00
    ),
    (
        'Repostería y Postres',
        'Domina macarons, tartas de frutas y mousses con acabados profesionales.',
        'Repostería',
        '2025-06-22',
        8,
        600.00
    ),
    (
        'Sushi Masterclass',
        'Taller intensivo de sushi: nigiri, maki y uramaki con pescado fresco y alternativas vegetarianas.',
        'Japonesa',
        '2025-08-10',
        10,
        700.00
    ),
    (
        'Cocina Vegana Creativa',
        'Platos 100% vegetales: hamburguesas, curry de legumbres y postres saludables.',
        'Vegana',
        '2025-07-18',
        15,
        500.00
    ),
    (
        'Sabores de México',
        'Tacos, salsas y guacamole hechos a mano con técnicas y chiles tradicionales.',
        'Mexicana',
        '2025-06-30',
        12,
        480.00
    ),
    (
        'Cocina Francesa Clásica',
        'Cremas, quiches, coq au vin y crème brûlée con orientación profesional.',
        'Francesa',
        '2025-09-05',
        10,
        750.00
    ),
    (
        'Tapas Españolas',
        'Preparación de pintxos, tortilla de patatas y paella en formato tapa.',
        'Española',
        '2025-07-12',
        14,
        520.00
    ),
    (
        'Parrilla y BBQ',
        'Cortes de carne, marinados y técnicas de ahumado al estilo americano.',
        'Barbacoa',
        '2025-08-25',
        16,
        650.00
    ),
    (
        'Cocina Tailandesa',
        'Green curry, pad thai y rollitos spring rolls con sabores auténticos.',
        'Tailandesa',
        '2025-09-15',
        12,
        580.00
    ),
    (
        'Café y Latte Art',
        'De la selección del grano a la espuma perfecta para crear arte en tu taza.',
        'Bebidas',
        '2025-06-20',
        8,
        400.00
    ),
    (
        'Dim Sum y Dumplings',
        'Masa casera y rellenos variados: cerdo, gambas y vegetales.',
        'China',
        '2025-07-28',
        12,
        550.00
    ),
    (
        'Curry Indio Tradicional',
        'Masalas, panes naan y arroz biryani con especias auténticas.',
        'India',
        '2025-08-18',
        14,
        620.00
    ),
    (
        'Cocina Mediterránea Saludable',
        'Ensaladas, pescados al horno y dip de hummus con aceite de oliva.',
        'Mediterránea',
        '2025-09-01',
        15,
        500.00
    ),
    (
        'Chocolate y Bombonería',
        'Temperado, trufas y bombones rellenos con acabados de lujo.',
        'Repostería',
        '2025-07-08',
        6,
        680.00
    )
    ;



-- Tabla de reservas con claves foráneas
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(100),
    workshop_id INT,
    status ENUM('Confirmada', 'Cancelada', 'Completada') DEFAULT 'Confirmada',
    payment_status ENUM('Pendiente', 'Pagado') DEFAULT 'Pendiente',
    UNIQUE(user_email, workshop_id),
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE,
    FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE CASCADE
);
