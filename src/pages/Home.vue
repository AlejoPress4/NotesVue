<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import NoteList from '../components/NoteList.vue';
import { useNotesStore } from '../stores/notes';

export default {
  name: 'Home',
  components: {
    NoteList
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const notesStore = useNotesStore();
    const toast = useToast();

    const loading = ref(true);
    const selectedCategory = ref('');
    const searchQuery = ref('');

    const categories = [
      'Personal',
      'Trabajo',
      'Estudio',
      'Proyectos',
      'Ideas',
      'Recordatorios'
    ];

    // Computed properties - ahora solo usan los datos del store
    const totalPages = computed(() => Math.ceil(notesStore.totalItems / notesStore.itemsPerPage));
    const currentPage = computed(() => notesStore.currentPage);
    const itemsPerPage = computed(() => notesStore.itemsPerPage);

    console.log('Total pages:', totalPages.value);
    // Watch for route query changes
    watch(() => route.query.search, (newQuery) => {
      searchQuery.value = newQuery || '';
      loadNotes(); // Recargar cuando cambie la búsqueda
    });

    watch(() => route.query.category, (newCategory) => {
      selectedCategory.value = newCategory || '';
      loadNotes(); // Recargar cuando cambie la categoría
    });

    // Watch for category selection changes
    watch(selectedCategory, (newCategory) => {
      router.push({
        query: { 
          ...route.query,
          category: newCategory || undefined 
        }
      });
    });

    // Watch totalPages for debugging
    watch(totalPages, (newTotalPages) => {
      console.log(`Total pages recalculated: ${newTotalPages}`);
    });

    // Methods
    const loadNotes = async (page = 1) => {
      loading.value = true;
      try {
        const params = {
          page,
          limit: notesStore.itemsPerPage,
          category: selectedCategory.value,
          search: searchQuery.value
        };
        
        await notesStore.fetchNotes(params);
        
        if (notesStore.notes.length === 0 && searchQuery.value) {
          toast.info(`No se encontraron notas para "${searchQuery.value}"`);
        }
      } catch (error) {
        console.error('Error al cargar las notas:', error);
        toast.error('Error al cargar las notas: ' + (error.message || 'Error desconocido'));
      } finally {
        loading.value = false;
      }
    };

    const editNote = (id) => {
      router.push(`/notes/edit/${id}`);
    };

    const deleteNote = async (id) => {
      if (confirm('¿Estás seguro de que deseas eliminar esta nota?')) {
        try {
          await notesStore.deleteNote(id);
          toast.success('Nota eliminada correctamente');
          // Recargar la página actual después de eliminar
          await loadNotes(currentPage.value);
        } catch (error) {
          console.error('Error al eliminar la nota:', error);
          toast.error('Error al eliminar la nota: ' + (error.message || 'Error desconocido'));
        }
      }
    };

    const viewNote = (id) => {
      router.push(`/notes/${id}`);
    };

    const toggleFavorite = async (id) => {
      try {
        const note = await notesStore.toggleFavorite(id);
        const message = note.is_favorite 
          ? 'Nota añadida a favoritos' 
          : 'Nota eliminada de favoritos';
        toast.success(message);
      } catch (error) {
        console.error('Error al actualizar favorito:', error);
        toast.error('Error al actualizar favorito: ' + (error.message || 'Error desconocido'));
      }
    };

    const prevPage = () => {
      if (currentPage.value > 1) {
        notesStore.goToPage(currentPage.value - 1);
      }
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        notesStore.goToPage(currentPage.value + 1);
      }
    };

    const goToPage = async (page) => {
      if (page >= 1 && page <= totalPages.value) {
        await loadNotes(page);
      }
    };

    // Lifecycle hooks
    onMounted(async () => {
      searchQuery.value = route.query.search || '';
      selectedCategory.value = route.query.category || '';
      await loadNotes();
    });

    return {
      loading,
      selectedCategory,
      categories,
      notes: computed(() => notesStore.notes), // Usar directamente las notas del store
      editNote,
      deleteNote,
      viewNote,
      toggleFavorite,
      currentPage,
      totalPages,
      itemsPerPage,
      prevPage,
      nextPage,
      goToPage
    };
  }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Mis Notas</h1>
        <div class="mt-3 sm:mt-0 flex items-center space-x-2">
          <div class="relative">
            <select
              v-model="selectedCategory"
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm rounded-md transition-colors duration-200"
            >
              <option value="">Todas las categorías</option>
              <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <NoteList
      :notes="notes"
      :loading="loading"
      :current-page="currentPage"
      :total-pages="totalPages"
      @edit="editNote"
      @delete="deleteNote"
      @view="viewNote"
      @toggle-favorite="toggleFavorite"
      @page-change="goToPage"
    />

    <!-- Controles de paginación -->
    <div class="flex justify-between items-center mt-6">
      <button 
        @click="prevPage" 
        :disabled="currentPage === 1"
        class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        Anterior
      </button>

      <span class="text-gray-700 dark:text-gray-300">
        Página {{ currentPage }}
      </span>

      <button 
        @click="nextPage" 
        :disabled="notes.length < itemsPerPage"
        class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        Siguiente
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Los estilos se manejan con Tailwind CSS */
</style>
