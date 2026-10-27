// Seleccionar o crear la base de datos de TechForge
use('techforge_db');

// 1. Crear colección 'categorias'
db.createCollection('categorias');

// 2. Crear colección 'productos' con validación híbrida ($jsonSchema)
// Valida los campos obligatorios del negocio pero deja 'especificaciones' libre (polimórfico)
db.createCollection('productos', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['sku', 'nombre', 'marca', 'categoria', 'precio', 'stock', 'activo', 'especificaciones'],
      properties: {
        sku: {
          bsonType: 'string',
          description: 'Identificador único del producto (obligatorio)'
        },
        nombre: {
          bsonType: 'string',
          description: 'Nombre comercial del artículo (obligatorio)'
        },
        marca: {
          bsonType: 'string',
          description: 'Fabricante o marca del producto (obligatorio)'
        },
        categoria: {
          bsonType: 'string',
          description: 'Categoría principal del catálogo (obligatorio)'
        },
        precio: {
          bsonType: ['double', 'int', 'decimal'],
          minimum: 0,
          description: 'Precio unitario mayor o igual a 0 (obligatorio)'
        },
        stock: {
          bsonType: 'int',
          minimum: 0,
          description: 'Cantidad disponible en inventario (obligatorio)'
        },
        activo: {
          bsonType: 'bool',
          description: 'Estado para desactivación lógica en el CRUD (obligatorio)'
        },
        especificaciones: {
          bsonType: 'object',
          description: 'Objeto polimórfico con atributos técnicos dinámicos según la categoría'
        }
      }
    }
  }
});

// 3. Crear Índices para acelerar las consultas masivas y el filtrado facetado
// Índice único para evitar SKUs duplicados
db.productos.createIndex({ sku: 1 }, { unique: true, name: 'idx_sku_unico' });

// Índice compuesto para el filtrado por categoría, subcategoría, marca y precio (Filtros Facetados)
db.productos.createIndex(
  { activo: 1, categoria: 1, subcategoria: 1, marca: 1, precio: 1 },
  { name: 'idx_catalogo_filtros' }
);

// Índice de texto para la barra de búsqueda interactiva
db.productos.createIndex(
  { nombre: 'text', marca: 'text', etiquetas: 'text', subcategoria: 'text' },
  { name: 'idx_busqueda_texto', default_language: 'spanish' }
);

// Índice Comodín (Wildcard Index) para indexar dinámicamente cualquier atributo dentro del objeto polimórfico 'especificaciones'
db.productos.createIndex(
  { 'especificaciones.$**': 1 },
  { name: 'idx_polimorfico_especificaciones' }
);

print('Base de datos techforge_db, esquemas polimórficos e índices creados exitosamente.');