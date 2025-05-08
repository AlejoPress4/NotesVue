import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const useNotesStore = defineStore('notes', {
  state: () => ({
    notes: [],
    isLoading: false,
    error: null
  }),
  
  actions: {
    async fetchNotes(params = {}) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const queryParams = new URLSearchParams();
        
        if (params.category) {
          queryParams.append('category', params.category);
        }
        
        if (params.search) {
          queryParams.append('search', params.search);
        }
        
        if (params.favorite !== undefined) {
          queryParams.append('favorite', params.favorite);
        }
        
        const response = await axios.get(`${API_URL}/notes?${queryParams.toString()}`);
        this.notes = response.data;
        return response.data;
      } catch (error) {
        this.error = error.message || 'Error al cargar las notas';
        console.error('Error fetching notes:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async getNoteById(id) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await axios.get(`${API_URL}/notes/${id}`);
        return response.data;
      } catch (error) {
        this.error = error.message || 'Error al cargar la nota';
        console.error('Error fetching note by ID:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async createNote(noteData) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await axios.post(`${API_URL}/notes`, noteData);
        this.notes.push(response.data);
        return response.data;
      } catch (error) {
        this.error = error.message || 'Error al crear la nota';
        console.error('Error creating note:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async updateNote(id, noteData) {
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await axios.put(`${API_URL}/notes/${id}`, noteData);
        
        // Update the note in the local state
        const index = this.notes.findIndex(note => note.id === id);
        if (index !== -1) {
          this.notes[index] = response.data;
        }
        
        return response.data;
      } catch (error) {
        this.error = error.message || 'Error al actualizar la nota';
        console.error('Error updating note:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    async deleteNote(id) {
      this.isLoading = true;
      this.error = null;
      
      try {
        await axios.delete(`${API_URL}/notes/${id}`);
        
        // Remove the note from the local state
        this.notes = this.notes.filter(note => note.id !== id);
        
        return true;
      } catch (error) {
        this.error = error.message || 'Error al eliminar la nota';
        console.error('Error deleting note:', error);
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
        
        // Update the note in the API
        const response = await axios.put(`${API_URL}/notes/${id}`, updatedNote);
        
        // Update the note in the local state
        const index = this.notes.findIndex(note => note.id === id);
        if (index !== -1) {
          this.notes[index] = response.data;
        }
        
        return response.data;
      } catch (error) {
        this.error = error.message || 'Error al actualizar favorito';
        console.error('Error toggling favorite:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    }
  }
});