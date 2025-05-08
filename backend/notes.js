const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // Obtener todas las notas con filtros opcionales
  router.get('/', async (req, res) => {
    try {
      let query = 'SELECT * FROM notes WHERE 1=1';
      const params = [];
      let paramIndex = 1;

      // Filtrar por categoría
      if (req.query.category) {
        query += ` AND category = $${paramIndex}`;
        params.push(req.query.category);
        paramIndex++;
      }

      // Filtrar por búsqueda en título o contenido
      if (req.query.search) {
        query += ` AND (title ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`;
        params.push(`%${req.query.search}%`);
        paramIndex++;
      }

      // Filtrar por favoritos
      if (req.query.favorite === 'true') {
        query += ` AND is_favorite = true`;
      }

      // Ordenar por fecha de creación (más reciente primero)
      query += ' ORDER BY created_at DESC';

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Error al obtener notas:', error);
      res.status(500).json({ error: 'Error al obtener notas' });
    }
  });

  // Obtener una nota por ID
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query('SELECT * FROM notes WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Nota no encontrada' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error al obtener nota por ID:', error);
      res.status(500).json({ error: 'Error al obtener nota' });
    }
  });

  // Crear una nueva nota
  router.post('/', async (req, res) => {
    try {
      const { title, content, category, is_favorite } = req.body;
      
      const result = await pool.query(
        'INSERT INTO notes (title, content, category, is_favorite) VALUES ($1, $2, $3, $4) RETURNING *',
        [title, content, category, is_favorite || false]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error al crear nota:', error);
      res.status(500).json({ error: 'Error al crear nota' });
    }
  });

  // Actualizar una nota existente
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content, category, is_favorite } = req.body;
      
      const result = await pool.query(
        'UPDATE notes SET title = $1, content = $2, category = $3, is_favorite = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
        [title, content, category, is_favorite, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Nota no encontrada' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error al actualizar nota:', error);
      res.status(500).json({ error: 'Error al actualizar nota' });
    }
  });

  // Eliminar una nota
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await pool.query('DELETE FROM notes WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Nota no encontrada' });
      }
      
      res.json({ message: 'Nota eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar nota:', error);
      res.status(500).json({ error: 'Error al eliminar nota' });
    }
  });

  return router;
};