import { defineStore } from "pinia";
import { useCrud } from "../composables/useCrud";
import { ref, computed } from "vue";

const API_URL = "http://localhost:3000/api/notes";

export const useNotesStore = defineStore("notes", () => {
  // Usar una sola instancia de useCrud
  const crud = useCrud(API_URL);
  const { items, item, loading, error, list, getById, create, update, remove } =
    crud;

  // Estado reactivo
  const notes = ref([]);
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const totalItems = ref(0);
  const lastUpdate = ref(null);
  const categories = ref([]);

  // Getters
  const getNotesByCategory = (category) => {
    return notes.value.filter((note) => note.category === category);
  };

  const getFavoriteNotes = computed(() =>
    notes.value.filter((note) => note.is_favorite)
  );

  const getUniqueCategories = computed(() =>
    [...new Set(notes.value.map((note) => note.category))].filter(Boolean)
  );

  // Acciones
  const fetchNotes = async (params = {}) => {
    try {
      const queryParams = {
        ...params,
        page: params.page ?? currentPage.value,
        limit: itemsPerPage.value,
      };

      const data = await list(queryParams);

      notes.value = items.value;
      totalItems.value = data?.pagination?.total || notes.value.length;
      currentPage.value = data?.pagination?.currentPage || currentPage.value;

      updateCategories();
      lastUpdate.value = new Date();
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const goToPage = async (pageNumber) => {
    currentPage.value = pageNumber;
    await fetchNotes({ page: pageNumber });
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
      await fetchNotes(); // recargar lista
      return newNote;
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const updateNote = async (id, noteData) => {
    try {
      const updated = await update(id, noteData);
      await fetchNotes({ page: currentPage.value }); // recargar página actual
      return updated;
    } catch (err) {
      handleError(err);
      throw err;
    }
  };

  const deleteNote = async (id) => {
    try {
      await remove(id);
      await fetchNotes({ page: currentPage.value }); // recargar página actual
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

      const updated = await update(id, {
        ...note,
        is_favorite: !note.is_favorite,
      });
      await fetchNotes({ page: currentPage.value }); // actualiza después del cambio
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

  const goToFavoritePage = async (pageNumber, category = "", search = "") => {
    currentPage.value = pageNumber;
    await fetchNotes({
      page: pageNumber,
      favorite: true,
      category: category || undefined,
      search: search || undefined,
    });
  };

  return {
    // State
    notes,
    item,
    currentPage,
    itemsPerPage,
    totalItems,
    lastUpdate,
    categories,
    isLoading: loading,
    error,

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
    goToPage,
    goToFavoritePage,
    updateCategories,
    clearError,
  };
});
