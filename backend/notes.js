const express = require('express');
const router = express.Router();

// Validación de nota con mensajes detallados para las notificaciones
const validateNote = (note) => {
  const errors = [];
  
  // Validación del título
  if (!note.title || note.title.trim().length === 0) {
    errors.push({
      type: 'error',
      message: 'El título es requerido',
      field: 'title'
    });
  } else if (note.title.trim().length > 255) {
    errors.push({
      type: 'error',
      message: 'El título no puede tener más de 255 caracteres',
      field: 'title'
    });
  }
  
  // Validación del contenido
  if (!note.content || note.content.trim().length === 0) {
    errors.push({
      type: 'error',
      message: 'El contenido es requerido',
      field: 'content'
    });
  }
  
  // Validación de la categoría
  if (!note.category || note.category.trim().length === 0) {
    errors.push({
      type: 'error',
      message: 'La categoría es requerida',
      field: 'category'
    });
  } else if (note.category.trim().length > 100) {
    errors.push({
      type: 'error',
      message: 'La categoría no puede tener más de 100 caracteres',
      field: 'category'
    });
  }
  
  return errors;
};

// Middleware para manejar errores de base de datos
const handleDatabaseError = (error, res) => {
  console.error('Error de base de datos:', error);
  if (error.code === '23505') { // Unique violation
    return res.status(400).json({ error: 'Ya existe una nota con ese título' });
  }
  if (error.code === '23502') { // Not null violation
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  res.status(500).json({ 
    error: 'Error en la base de datos',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
  });
};

module.exports = (pool) => {
  // Obtener todas las notas con filtros opcionales y paginación
  router.get('/', async (req, res) => {
    try {
      const { page = 1, limit = 10, category, search, favorite } = req.query;
      const offset = (page - 1) * limit;
      
      let query = 'SELECT * FROM notes WHERE 1=1';
      const countQuery = 'SELECT COUNT(*) FROM notes WHERE 1=1';
      const params = [];
      let paramIndex = 1;
      
      // Añadir filtros a las consultas
      if (category) {
        query += ` AND category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }

      if (search) {
        query += ` AND (title ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      if (favorite === 'true') {
        query += ` AND is_favorite = true`;
      }

      // Añadir ordenamiento y paginación
      query += ' ORDER BY created_at DESC LIMIT $' + paramIndex + ' OFFSET $' + (paramIndex + 1);
      params.push(limit, offset);

      // Ejecutar ambas consultas en paralelo
      const [notes, countResult] = await Promise.all([
        pool.query(query, params),
        pool.query(countQuery + (params.length > 0 ? ' AND ' + query.split('WHERE 1=1')[1].split('ORDER BY')[0] : ''), 
          params.slice(0, -2))
      ]);

      const total = parseInt(countResult.rows[0].count);
      
      res.json({
        notes: notes.rows,
        pagination: {
          total,
          totalPages: Math.ceil(total / limit),
          currentPage: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      handleDatabaseError(error, res);
    }
  });

  // Obtener una nota por ID
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      if (!Number.isInteger(parseInt(id))) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const result = await pool.query('SELECT * FROM notes WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Nota no encontrada' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      handleDatabaseError(error, res);
    }
  });

  // Crear una nueva nota
  router.post('/', async (req, res) => {
    try {
      const { title, content, category, is_favorite } = req.body;
      
      // Validar los datos de entrada
      const errors = validateNote(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      
      const result = await pool.query(
        'INSERT INTO notes (title, content, category, is_favorite) VALUES ($1, $2, $3, $4) RETURNING *',
        [title.trim(), content.trim(), category.trim(), is_favorite || false]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      handleDatabaseError(error, res);
    }
  });

  // Actualizar una nota existente
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      if (!Number.isInteger(parseInt(id))) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const { title, content, category, is_favorite } = req.body;
      
      // Validar los datos de entrada
      const errors = validateNote(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }
      
      const result = await pool.query(
        'UPDATE notes SET title = $1, content = $2, category = $3, is_favorite = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
        [title.trim(), content.trim(), category.trim(), is_favorite, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Nota no encontrada' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      handleDatabaseError(error, res);
    }
  });

  // Eliminar una nota
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      if (!Number.isInteger(parseInt(id))) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      
      const result = await pool.query('DELETE FROM notes WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Nota no encontrada' });
      }
      
      res.json({ message: 'Nota eliminada correctamente', note: result.rows[0] });
    } catch (error) {
      handleDatabaseError(error, res);
    }
  });

  return router;
};