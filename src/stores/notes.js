import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Configurar axios para manejar CORS
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

export const useNotesStore = defineStore('notes', {
  state: () => ({
    notes: [],
    isLoading: false,
    error: null,
    categories: [],
    lastUpdate: null
  }),

  getters: {
    getNotesByCategory: (state) => {
      return (category) => state.notes.filter(note => note.category === category);
    },
    getFavoriteNotes: (state) => {
      return state.notes.filter(note => note.is_favorite);
    },
    getUniqueCategories: (state) => {
      return [...new Set(state.notes.map(note => note.category))];
    }
  },
  
  actions: {
    async fetchNotes(params = {}) {
      if (this.isLoading) return; // Prevenir múltiples llamadas simultáneas
      
      this.isLoading = true;
      this.error = null;
      
      try {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value);
          }
        });
        
        console.log(`Fetching notes from: ${API_URL}/notes?${queryParams.toString()}`);
        const response = await axios.get(`${API_URL}/notes?${queryParams.toString()}`);
        console.log('API Response:', response.data);
        
        // Verificar si la respuesta tiene la estructura esperada
        if (response.data && Array.isArray(response.data)) {
          this.notes = response.data;
        } else if (response.data && Array.isArray(response.data.notes)) {
          this.notes = response.data.notes;
        } else if (response.data && typeof response.data === 'object') {
          // Si la respuesta es un objeto pero no tiene la estructura esperada
          this.notes = Array.isArray(response.data) ? response.data : [];
          console.warn('Formato de respuesta inesperado:', response.data);
        } else {
          console.warn('Formato de respuesta inesperado:', response.data);
          this.notes = [];
        }
        
        this.lastUpdate = new Date();
        this.updateCategories();
        return this.notes;
      } catch (error) {
        console.error('Error fetching notes:', error);
        this.handleError(error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async getNoteById(id) {
      this.isLoading = true;
      this.error = null;
      
      try {
        console.log(`Fetching note by ID: ${API_URL}/notes/${id}`);
        const response = await axios.get(`${API_URL}/notes/${id}`);
        console.log('Note data:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching note by ID:', error);
        this.error = error.response?.data?.error || error.message || 'Error al cargar la nota';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async createNote(noteData) {
      this.isLoading = true;
      this.error = null;
      
      try {
        console.log('Creating note with data:', noteData);
        const response = await axios.post(`${API_URL}/notes`, noteData);
        console.log('Created note:', response.data);
        
        // Asegurarse de que la nota se añada al estado
        if (response.data && response.data.id) {
          // Verificar si la nota ya existe en el estado
          if (!this.notes.some(note => note.id === response.data.id)) {
            this.notes.unshift(response.data);
          }
          this.updateCategories();
          return response.data;
        } else {
          throw new Error('La respuesta del servidor no contiene una nota válida');
        }
      } catch (error) {
        console.error('Error creating note:', error);
        this.error = error.response?.data?.error || error.message || 'Error al crear la nota';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async updateNote(id, noteData) {
      this.isLoading = true;
      this.error = null;
      
      try {
        console.log(`Updating note ${id} with data:`, noteData);
        const response = await axios.put(`${API_URL}/notes/${id}`, noteData);
        console.log('Updated note:', response.data);
        
        // Update the note in the local state
        if (response.data && response.data.id) {
          const index = this.notes.findIndex(note => note.id === id);
          if (index !== -1) {
            this.notes[index] = response.data;
          } else {
            // Si la nota no está en el estado, la añadimos
            this.notes.unshift(response.data);
          }
          
          this.updateCategories();
          return response.data;
        } else {
          throw new Error('La respuesta del servidor no contiene una nota válida');
        }
      } catch (error) {
        console.error('Error updating note:', error);
        this.error = error.response?.data?.error || error.message || 'Error al actualizar la nota';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async deleteNote(id) {
      this.isLoading = true;
      this.error = null;
      
      try {
        console.log(`Deleting note ${id}`);
        await axios.delete(`${API_URL}/notes/${id}`);
        console.log('Note deleted successfully');
        
        // Remove the note from the local state
        this.notes = this.notes.filter(note => note.id !== id);
        
        this.updateCategories();
        return true;
      } catch (error) {
        console.error('Error deleting note:', error);
        this.error = error.response?.data?.error || error.message || 'Error al eliminar la nota';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async toggleFavorite(id) {
      this.isLoading = true;
      this.error = null;
      
      try {
        // Find the note in the local state
        const note = this.notes.find(note => note.id === id);
        if (!note) {
          throw new Error('Nota no encontrada');
        }
        
        // Toggle the favorite status
        const updatedNote = { ...note, is_favorite: !note.is_favorite };
        
        console.log(`Toggling favorite for note ${id}:`, updatedNote);
        // Update the note in the API
        const response = await axios.put(`${API_URL}/notes/${id}`, updatedNote);
        console.log('Favorite toggled:', response.data);
        
        // Update the note in the local state
        if (response.data && response.data.id) {
          const index = this.notes.findIndex(note => note.id === id);
          if (index !== -1) {
            this.notes[index] = response.data;
          }
          
          return response.data;
        } else {
          throw new Error('La respuesta del servidor no contiene una nota válida');
        }
      } catch (error) {
        console.error('Error toggling favorite:', error);
        this.error = error.response?.data?.error || error.message || 'Error al actualizar favorito';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    updateCategories() {
      this.categories = this.getUniqueCategories;
    },

    handleError(error) {
      this.error = error.response?.data?.error || error.message || 'Error en la operación';
      console.error('Error en la operación:', error);
    },

    clearError() {
      this.error = null;
    }
  }
});