import { defineStore } from "pinia";
import axios from "axios";
import { useCrud } from "../composables/useCrud";
import { ref, computed } from "vue";

const API_URL = "http://localhost:3000/api/notes";

export const useNotesStore = defineStore("notes", () => {
  const { items, item, loading, error, list, getById, create, update, remove } =
    useCrud(API_URL);

  const isLoading = loading;
  const notes = computed(() => (Array.isArray(items.value) ? items.value : []));
  const lastUpdate = ref(null);
  const categories = ref([]);

  // Getters
  const getNotesByCategory = (category) => {
    return notes.value.filter((note) => note.category === category);
  };

  const getFavoriteNotes = computed(() => {
    return notes.value.filter((note) => note.is_favorite);
  });
  const getUniqueCategories = computed(() => {
    return Array.isArray(notes.value)
      ? [...new Set(notes.value.map((note) => note.category))]
      : [];
  });

  // Actions
  const fetchNotes = async (params = {}) => {
    if (isLoading.value) return;
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value);
        }
      });

      const url = `${API_URL}?${queryParams.toString()}`;
      await list(queryParams); // useCrud modificado para aceptar params
      lastUpdate.value = new Date();
      updateCategories();
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const getNoteById = async (id) => {
    try {
      await getById(id);
      return item.value;
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const createNote = async (noteData) => {
    try {
      const newNote = await create(noteData);
      updateCategories();
      return newNote;
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const updateNote = async (id, noteData) => {
    try {
      const updated = await update(id, noteData);
      updateCategories();
      return updated;
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const deleteNote = async (id) => {
    try {
      await remove(id);
      updateCategories();
      return true;
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const toggleFavorite = async (id) => {
    try {
      const note = notes.value.find((n) => n.id === id);
      if (!note) throw new Error("Nota no encontrada");
      note.is_favorite = !note.is_favorite;
      const updated = await update(id, note);
      return updated;
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const updateCategories = () => {
    categories.value = getUniqueCategories.value;
  };

  const handleError = (err) => {
    console.error("Error en la operación:", err);
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    notes,
    item,
    isLoading,
    error,
    categories,
    lastUpdate,

    // Getters
    getNotesByCategory,
    getFavoriteNotes,
    getUniqueCategories,

    // Actions
    fetchNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote,
    toggleFavorite,
    updateCategories,
    clearError,
  };
});
